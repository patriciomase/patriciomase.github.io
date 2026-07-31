---
publishedAt: 2026-07-30
readMinutes: 10
status: published
eyebrow: AI workflows · Tooling
title: Claude Code, pointed at a 3D printer
lead: I use a coding agent every day for software. This time I pointed it at a hardware problem instead. It turns out the interesting question is not whether it knows about 3D printers — it is what happens when something patient, literal, and tireless is allowed to run commands and read the output.
excerpt: I use a coding agent every day for software. I pointed it at a hardware problem instead. What it was better at than me, where it was confidently wrong, and the one discovery it could not have made.
metaDescription: I use a coding agent every day for software. I pointed it at a hardware problem instead — calibrating and debugging a 3D printer — and it found three faults I had lived with for months.
---

## Why this works at all

Coding agents are marketed as things that write code. That framing undersells them, and it made me slow to try this. The actual capability is narrower and more general at the same time: **they can run commands, read the output, and decide what to run next.**

Which means anything that speaks text is fair game. And a 3D printer speaks text — remarkably plain text:

- The board appears as a serial device, `/dev/ttyUSB0`.
- Gcode is a line-based ASCII protocol. You send `M105`, you get `ok T:23.79 /0.00 B:23.71 /0.00`.
- Printer firmware exposes its whole configuration through `M503`.
- OctoPrint puts a REST API in front of all of it.

None of that is a coding problem. All of it is a "run a command, read the reply" problem, which is exactly the shape these tools are good at.

## What the loop actually looks like

My printer had been printing badly for months. Parts cracked along the layer lines, and I had to dial in a slightly different Z offset before every single print. I had stopped treating either as a problem.

The working loop went like this. The agent would write a throwaway Python script, run it against the printer, and read what came back. I would do the physical half — sliding a sheet of paper under the nozzle, feeling the drag, turning a screw, tightening a bolt — and report what I felt. Then it would decide what to check next.

Here is a real example, and it is the moment I stopped being sceptical. OctoPrint was showing an empty temperature graph even though the firmware claimed to support temperature auto-reporting. Rather than theorise, the agent dumped the raw bytes coming off the serial line:

```
  TT::23.9523.95  //0.000.00  BB::23.7523.75  //0.000.00
```

A normal report reads `T:23.95 /0.00 B:23.75 /0.00`. The firmware was sending **two copies of the same line, interleaved field by field** — two writers hitting one serial buffer. Unparseable by anything.

I would not have looked there. I would have Googled the symptom, found a forum thread, and applied whatever fix had the most upvotes. The agent went one layer below the abstraction that was lying and read the actual bytes.

## Where it was genuinely better than me

### It does not get bored

After flashing new firmware, the printer went completely silent. Not garbled — silent. That looks exactly like dead hardware, and it is where I would have started panicking about a bricked board.

Instead it swept every plausible baud rate in one pass and found the answer in about forty seconds: the new firmware runs at 250000 where the stock firmware used 115200. Boring, systematic, correct.

The same patience showed up when reading back a 25-point bed mesh, checking that every one of them survived a reload from EEPROM, and re-verifying settings after each config rewrite. That is work I would have skipped.

### It turns "feels better" into a test

This was the most valuable thing, and the least expected.

When we suspected the Z axis was losing position, I tightened a couple of bolts and said it felt solid. That was not accepted as evidence. Instead I got two acceptance tests, defined _before_ the fix:

- **Homing repeatability** — home, move to a fixed point, paper test, five times. All five must feel identical.
- **Travel retention** — cycle the Z axis up and down fifteen times, about a metre and a half of lead screw travel, then return to the same point _without re-homing_. The drag must be unchanged.

Both passed. That is a different quality of confidence than "seems fine now", and it is a discipline I apply to software constantly and had never once applied to my own printer.

### It writes everything down as it goes

By the end there was a private repo containing the firmware binary actually running on the machine with its checksum, a pre-flash EEPROM dump, the bed mesh, the calibration values with the reasoning behind each one, and the scripts used to verify them.

I did not ask for most of that. It accumulated as a side effect, and it is the difference between having fixed a printer and being able to fix it again in a year.

One detail stuck with me. We found that the bed mesh survives a power cycle but the flag that _enables_ it does not — so a print silently ignores the mesh unless the start gcode turns it back on. Rather than write that in a comment and hope, it went into the slicing script as a hard check:

```bash
if grep -q 'M420 S1' "$OUT"; then
    echo "  mesh compensation enabled ......... yes"
else
    echo "  mesh compensation enabled ......... NO -- ABORTING" >&2
    exit 1
fi
```

The script now refuses to send gcode that would ignore the mesh. A lesson turned into a guard rail. That is a very software instinct applied to a physical machine, and it is right.

## Where it was wrong

This part matters more than the wins, because an assistant you cannot calibrate is not useful.

**It refused to believe a correct measurement.** We measured my extruder feeding 68 mm when told to feed 100. The corrected value came out at 137.78 steps/mm against a factory default of 93. It flatly said it did not believe the number and refused to write it, on the grounds that a 48% error would have made every print I ever made visibly broken.

Reasonable prior. Wrong conclusion — because it assumed stock hardware, and I have an aftermarket extruder. Once I mentioned that, plus the fact that I had been running 125% flow for months to stop parts cracking, it reversed immediately and said the earlier objection had been based on a bad assumption. The measurement was right. My printer really had been feeding two thirds of what it was told.

**It over-warned.** It insisted a thermal calibration was invalid because filament was loaded. We redid it properly. The difference was about 1%. It said so plainly afterwards rather than quietly moving on, which I appreciated, but I had spent ten minutes on nothing.

**It removed a workaround too early.** A single successful test convinced it a firmware bug was fixed, so it deleted the mitigation. The connection died ninety seconds later, every time, in a way that looks exactly like dead hardware. It put the mitigation back with a comment that now reads: _do not remove this again without watching the connection for more than two minutes._

**It overstated its evidence once.** It told me the position readout proved the axis was moving correctly. It does not — that number is the firmware's own step count, not a measurement, because there is no encoder on the machine. It corrected itself when this became relevant, but for a while I was reassured by something that proved nothing.

## The part it could not do

The biggest single discovery in the whole exercise was mine, and it was not technical.

We had levelled the bed corner by corner. The centre then read as 0.8 mm high — a huge, alarming number that suggested a warped bed. The agent was systematically stepping the nozzle up in increments to measure the dome, and I was about to start looking for something trapped under the plate.

Instead I said: go back to the first corner, the one we calibrated twenty minutes ago, and check it again.

The nozzle was pressed into the bed there too. The bed was fine. The _reference_ had been drifting the entire time, and the centre, measured last, had accumulated the most error. The real fault was two slightly loose bolts holding the lead-screw nut to the gantry — loose enough that the gantry could move vertically without the screw turning.

The agent had been measuring carefully and correctly against a ruler that was moving. It had no way to suspect that, because every reading it took was internally consistent. What it lacked was the thing that made me say it: a vague physical distrust of a number that felt too large for the machine in front of me.

That is the honest division of labour. It has patience, recall, arithmetic, and no ego about being wrong. I have hands, eyes, and a sense of when something smells off.

## How to actually get value out of this

Things that made the difference, and that transfer to any non-software problem:

- **Make it produce measurements, not opinions.** "Is it fixed?" gets you a plausible paragraph. "What test would prove it is fixed, and what result would falsify it?" gets you something useful.
- **Give it the context it cannot see.** Its worst call of the whole session came from assuming stock hardware. One sentence from me about the aftermarket extruder flipped it instantly. It cannot look at your machine.
- **Push back when it is confidently wrong.** It updated cleanly every time, without argument or grovelling. An assistant that folds under pressure is dangerous; one that reverses on evidence is a colleague.
- **Let it write things down.** The documentation was free, and it is the part I will still be using next year.
- **Do the physical half honestly.** Every reading it had came from me describing paper drag. Garbage in, confident garbage out.

## The result

Three faults, each hiding the others: extruder steps wrong by 48%, the slicer configured for a 0.4 mm nozzle when a 0.6 mm was fitted, and a Z axis quietly losing height on every move. The first two made parts crack. The third meant no levelling ever stayed put — and was the reason I had been typing a fresh Z offset before every print for months without ever calling it a bug.

The first print afterwards was cleaner than anything the machine produced when it was new.

None of that required the agent to know anything about 3D printing. It required it to run commands, read output, do arithmetic without getting tired, and write down what it learned. That is a much broader tool than "it writes code for you" suggests — and it is why I now reach for it on problems that have nothing to do with software.

The terminal turns out to be a fairly universal interface. Most things worth debugging are already on the other side of it.
