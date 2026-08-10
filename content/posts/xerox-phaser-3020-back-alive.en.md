---
publishedAt: 2026-08-03
readMinutes: 6
status: published
eyebrow: Linux · Hardware
title: Xerox Phaser 3020 back alive
lead: A host-based laser printer that produced no output on Ubuntu 24.04, and reported every job as completed. Diagnosis, two incorrect drivers, the firmware fault they caused, and the working configuration — including network exposure over IPP.
excerpt: A Xerox Phaser 3020 producing blank pages under Ubuntu 24.04. Why CUPS reported success, why two plausible drivers failed differently, and the driver and sharing configuration that works.
metaDescription: Getting a Xerox Phaser 3020 working on Ubuntu 24.04 — the Samsung ULD driver (rastertospl + M2020 PPD), a firmware assertion caused by splix, and sharing the queue over IPP as an AirPrint/Mopria printer.
---

## Summary

A Xerox Phaser 3020 connected over USB to an Ubuntu 24.04 host printed nothing. Ubuntu's automatic driver selection was wrong, and the obvious alternative was also wrong and additionally crashed the printer's firmware. The working configuration is Samsung's Unified Linux Driver — `rastertospl` plus the `Samsung M2020 Series` PPD — because the Phaser 3020 is a rebadged Samsung M2020. Once printing locally, the queue was shared over IPP with Bonjour advertisement, which makes it usable as a driverless AirPrint/Mopria printer.

## Device characteristics

Three properties determine everything else.

**It is host-based.** Also called GDI or Winprinter. There is no PostScript or PCL interpreter in the device. It cannot render a page description. The host rasterises the page and transmits a bitmap stream in a vendor format — here, Samsung **SPL**.

**Consequently the driver is not approximate.** On a PostScript device an imperfect PPD yields an imperfect page. Here an incorrect driver produces a byte stream the device cannot parse at all. The observable failure is a blank sheet or none.

**The Phaser 3020 is a rebadged Samsung M2020.** Same engine, same firmware lineage, same page description language. This is not stated on the packaging, in the manual, or on Xerox's driver pages, and it is the single fact the fix depends on.

Identification on the host:

```bash
lsusb                       # 0924:42d5, serial 3434417634
lpstat -l -p Phaser-3020    # queue state and bound interface
lpoptions -p Phaser-3020    # device-uri, printer-make-and-model, PPD in use
```

## Why the success signal is not a signal

CUPS reported `completed` for every job, including the ones that produced blank paper. This is correct behaviour and not a bug: **a completed job means the filter chain ran and the backend wrote the bytes to the device without error.** It asserts nothing about whether the device parsed them, and nothing about whether a page was produced.

For the same reason `/var/log/cups/error_log` stays clean through a total failure. `cupsctl --debug-logging` makes it log the full filter chain, which is useful for confirming *which* filters ran, but a clean log only establishes that the host half of the pipeline had no problem.

Usable signals, in order of reliability:

| Signal | What it establishes |
| --- | --- |
| Physical output | Whether the device parsed the stream. The only direct evidence. |
| USB device number in `lsusb` | A device that renumbers mid-job has reset. |
| `lpstat` queue state | Whether the backend lost the device. |
| `error_log` filter chain | Which driver actually ran. Not whether it was correct. |

## Failure 1 — foo2hbpl2 (Xerox Phaser 3010 PPD)

Ubuntu's automatic setup bound a Phaser **3010** PPD driving the `foo2hbpl2` filter. That filter emits **HBPL**, in colour. The device is monochrome and parses SPL only.

Result: the filter chain completed without error, the device received several megabytes it could not interpret, produced mechanical noise and a feed cycle, and output a blank sheet. No error was recorded anywhere on the host.

## Failure 2 — splix (Samsung ML-2165 PPD), and a firmware assertion

Second attempt: **splix**, the open-source SPL driver, with a Samsung ML-2165 PPD. Correct language family, correct vendor, plausible model.

The filter chain again reported no error. Then the queue disabled itself mid-job with *"Unplugged or turned off"*, and the USB device number incremented across attempts — 004, then 005, then 006 — with no physical intervention.

That pattern is the recognised signature of a `usblp` versus libusb-backend contention, and that was the initial diagnosis. It was wrong. The pages being produced were not blank; they carried:

```
Exception report
Assertion failed: file MM_Lib.c line 2226
```

`MM_Lib.c` is a memory-manager source file in the **printer's own firmware**. The device was hitting a failed assertion while parsing splix's SPL, emitting a crash report, and rebooting. A USB device that reboots disconnects and re-enumerates with a new device number, which fully accounts for both the queue disable and the incrementing device numbers.

:::callout
Incrementing USB device numbers during a job on a host-based printer indicate a **firmware reset** far more often than a `usblp` conflict. Check for an exception page in the output tray before blacklisting kernel modules.
:::

The general point: every host-side observation was accurate and consistent with the incorrect hypothesis. The disambiguating evidence was produced by the failing device on paper, outside the instrumented channel entirely.

## Working configuration

Samsung's Unified Linux Driver supplies the `rastertospl` filter and the `Samsung M2020 Series` PPD. Samsung no longer distributes it; the **SULD** repository at `bchemnet.com/suldr` maintains it. Installed as local `.deb` files rather than as a permanent third-party apt source:

```bash
sudo apt-get install -y \
  ./suldr-keyring.deb \
  ./suld-driver2-common.deb \
  ./suld-ppd-4.deb \
  ./suld-driver2.deb

sudo lpadmin -p Phaser-3020 \
  -P /usr/share/ppd/suld/Samsung_M2020_Series.ppd.gz -E
```

Two dependency notes:

- **Install order matters.** `suld-driver2-common` depends on `suldr-keyring`. Omitting the keyring fails with `Depends: suldr-keyring but it is not installable`, which is easy to misread as optional when installing from local files.
- **`libcupsimage2` does not exist under that name on Ubuntu 24.04.** The 64-bit `time_t` transition renamed it `libcupsimage2t64`, which declares `Provides: libcupsimage2`. `apt` resolves this; `dpkg -i` does not, and reports an apparently fatal dependency error.

Verification after install:

```bash
ls /usr/lib/cups/filter/rastertospl
ls /usr/share/ppd/suld/Samsung_M2020_Series.ppd.gz
lpoptions -p Phaser-3020 | tr ' ' '\n' | grep printer-make-and-model
```

A test print then completed in about 8.5 s with correct output, no exception page, and — the check that matters — a stable USB device number before, during and after the job.

> Fallback if this regresses: the HP-maintained variant, `suld-driver2-1.00.39hp` with `suld-ppd-5`.

## Network exposure

The 3020 has integrated WiFi but no display, so network association requires WPS or a Windows-only USB tool, and Samsung host-based network printing is unreliable on Linux regardless — the device still cannot render, it merely receives SPL over a socket instead of a cable. A sweep of both local subnets for port 9100, an ARP check for Xerox/Samsung OUIs, and an mDNS query confirmed it had never been on a network.

Since the host is always on, the queue was shared instead:

```bash
sudo cupsctl --share-printers
sudo lpadmin -p Phaser-3020 -o printer-is-shared=true
```

`cupsd.conf` requires two changes: `Listen *:631`, since the default binds loopback only, and `Allow @LOCAL` inside `<Location />`. `@LOCAL` resolves to the subnets the host is directly attached to, which grants LAN access and no external access. Back up the file, and validate with `cupsd -t` before restarting so a syntax error cannot leave the host without a print service. `avahi-daemon` publishes the DNS-SD record.

The resulting TXT record includes:

```
mopria-certified=1.3
URF=DM3,IS1,V1.4,W8,CP255,RS300-600,SRGB24,...
```

These are the keys iOS and Android look for. CUPS advertises the shared queue as a **driverless AirPrint and Mopria printer**, which is accurate: the client sends standard PDF or PWG raster, and the server runs `rastertospl` to produce the SPL the device requires. A 2013 host-based mono laser therefore appears in the iOS print sheet with no app, driver or configuration. Verified with `ipptool -tv ipp://<host>:631/printers/Phaser-3020 get-printer-attributes.test` and a print from an iPhone.

## Limitation

The printer cannot be powered off between jobs. Wake-on-LAN applies when the printer is itself the network endpoint and keeps its NIC listening. Here the network endpoint is the server and the printer is a USB peripheral behind it, so there is no wake path — a job sent to a powered-off printer queues or fails. Left powered, the device enters deep sleep at a few watts and wakes on the first byte of a job.

## Notes

- A success status describes the reporting layer, not the layer below it. `completed` from CUPS means the write succeeded.
- On host-based hardware, a clean log is consistent with total failure, because the fault occurs downstream of everything that logs.
- Establish rebadging early. Searching for Xerox Phaser 3020 Linux support returns very little; the device is supported, under another vendor's model number.
- Device-generated output — status pages, exception reports — is a diagnostic channel that host-side instrumentation does not cover.
