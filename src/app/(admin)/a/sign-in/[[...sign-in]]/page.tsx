import { SignIn } from "@clerk/nextjs";

/**
 * The only page under /a that doesn't require a session. Signing in gets you
 * no further than this on its own -- `requireAdmin` still has to recognise the
 * email address.
 */
export default function SignInPage() {
  return (
    <div className="sign-in">
      <SignIn />
    </div>
  );
}
