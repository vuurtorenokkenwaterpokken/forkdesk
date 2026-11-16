# Forkdesk roadmap

Forkdesk is a fork of GitHub Desktop for working with several github.com
accounts on one Windows machine, each with its own SSH key. It builds on the
setup most people already have: host aliases in `~/.ssh/config` and
`includeIf` rules in `~/.gitconfig`. Forkdesk reads that setup and keeps it
intact. It never replaces it.

This roadmap is not fixed and changes as the fork is used. The roadmap of
GitHub Desktop itself is in [docs/process/roadmap.md](../process/roadmap.md).

## Principles

- Git keeps talking to GitHub through `git` and `ssh`, with no SSH
  implementation of its own.
- Existing configuration is read and respected. Writes to `~/.ssh/config` and
  `~/.gitconfig` make a `.bak-<timestamp>` backup first and either append or
  stay within a managed block, so running them twice changes nothing.
- Private keys are never read, logged or sent to the renderer. Only their paths
  are.
- Someone with a single account shouldn't notice any of this.
- Forkdesk uses its own name, logo, protocols and OAuth app. It doesn't use
  GitHub's update server or send usage statistics.

## Done

### Phase 0: a fork of its own

Forkdesk has its own name, icons and logo ([logo.svg](../../app/static/logos/logo.svg)),
its own `x-forkdesk-*` protocols, keychain entries and OAuth app, so it runs
next to GitHub Desktop without getting in its way. Automatic updates and usage
statistics are turned off.

### Phase 1: the real cause of SSH failures

Forkdesk shows what actually went wrong with SSH instead of "Authentication
failed". Examples are a file Windows OpenSSH refuses because of its
permissions, or an alias that doesn't resolve. The bundled `ssh` is the
default again. Windows OpenSSH is optional, under "Use system OpenSSH".

### Phase 2: SSH host aliases

A remote like `git@github-work:owner/repo.git` is recognized as github.com.
Pull requests, checks and avatars work for those repositories, including
aliases that don't follow a naming convention, such as `github.com-roling`.

### Phase 3: several accounts per endpoint

Several github.com accounts can be signed in at once, and each repository uses
the right one. The account comes from the repository's alias, through
`ssh -T`. Forkdesk never falls back to the token of another account. The
toolbar and the repository list show which account a repository uses.

### Phase 4: repository groups

A group ties an SSH alias, a GitHub account and a commit identity together.
Forkdesk writes the identity to a managed block in `~/.gitconfig`. Cloning into
a group rewrites the URL to its alias, and a repository can be moved to a
group from the repository list.

### Phase 5: adding an account and SSH key

A wizard creates a key, adds the public key to GitHub, writes the `Host` entry
and checks the result with `ssh -T`. Optionally, it creates a group as well.

### After the phases

- A collapsible sidebar to the left of Changes and History lists the
  repositories by group.
- The app is called Forkdesk wherever Windows shows its name.
- GitHub's internal Desktop endpoints aren't called, as they don't answer
  Forkdesk.
- `yarn dist` builds a Windows installer.
- `yarn icons` makes every app icon from `logo.svg`: the Windows `.ico`
  files, the macOS `.icns` files and Icon Composer documents, and the PNGs
  for the app and Linux.

## Still to verify in daily use

- Pushing through an alias for each of the accounts.
- Creating a group and committing with its identity.
- Installing with the installer on a machine without a development setup.

## Known limitations

- Groups can be created and removed, but not edited.
- A repository can't be linked to an account by hand. The account follows
  from its alias or owner.
- Publishing a new repository uses the first signed-in account.
- The wizard doesn't offer to protect the new key with a passphrase.
- Submodules that use an alias aren't linked to an account.
- The repository sidebar has no filter and no context menu. "Move to group"
  is only in the repository list in the toolbar.
- The toolbar's "Current repository" button no longer lines up with the
  columns below it.
- Without GitHub's internal endpoints, there are no live notifications for
  failed checks or reviews, and no features that GitHub turns on per account.
- The installer isn't signed, so Windows SmartScreen warns the first time.
  Forkdesk doesn't update itself.
- Forkdesk is only built and tested on Windows. A macOS build also needs
  `Assets.car`, which `script/compile-macos-icons.sh` compiles from the Icon
  Composer documents. That script needs Xcode 26 and hasn't been run yet.

## Ideas for later

These are possibilities, not commitments.

- Edit a group, and choose the account of a repository by hand.
- Choose the account to publish a repository with.
- A filter and the context menu of the repository list in the sidebar.
- A passphrase option in the wizard, with `ssh-agent` support.
- Release builds through GitHub Actions, with an update feed of its own.
- Regularly merging GitHub Desktop's changes from `upstream`.
