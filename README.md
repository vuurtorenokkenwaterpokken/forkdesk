# <img src="app/static/logos/logo.svg" width="40" height="40" alt=""> Forkdesk

Forkdesk is a fork of [GitHub Desktop](https://github.com/desktop/desktop) for
using several github.com accounts on one Windows machine, each with its own SSH
key. Personal, work or client accounts are all signed in at once. Every
repository then uses the right account, key and commit identity, without
switching anything by hand.

Forkdesk is not made, supported or endorsed by GitHub.

## What it adds

- **SSH host aliases:** a remote like `git@github-work:owner/repo.git` is
  recognized as github.com, so pull requests, checks and avatars work.
- **Several accounts:** each repository uses the account its alias belongs to,
  and never the token of another account.
- **Repository groups:** a group ties an alias, an account and a commit name and
  email together. Cloning into a group uses its alias.
- **Adding an account:** a wizard creates an SSH key, adds it to GitHub, writes
  the `Host` entry and checks that it works.
- **Repository sidebar:** a collapsible sidebar lists all repositories by group,
  with a filter and the usual context menu.
- **Publishing with any account:** choose the account to publish a repository
  with.
- **Clear SSH errors:** the actual cause, instead of "Authentication failed".

Everything else works as in GitHub Desktop.

## How it uses your setup

Forkdesk builds on the usual way to set up several accounts with SSH: a host
alias per account in `~/.ssh/config`, for example:

```
Host github-work
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_work
  IdentitiesOnly yes
```

Forkdesk reads that configuration and keeps it intact. When it writes to
`~/.ssh/config` or `~/.gitconfig`, it first makes a `.bak-<timestamp>` backup,
then either appends or only changes a block it manages itself. It never reads
private keys, only their paths. Git still connects through `git` and `ssh`.

## Getting started

There are no published downloads. You build Forkdesk yourself.

1. Install Node.js, Yarn 1 and Python 3, as described in
   [the Windows setup guide](docs/contributing/setup-windows.md).
2. Register an [OAuth app](https://github.com/settings/applications/new) on
   GitHub with `x-forkdesk-auth://oauth` as the authorization callback URL.
3. Copy `.forkdesk.env.example` to `.forkdesk.env` and fill in the client ID and
   secret of that app.
4. Install the dependencies:

   ```
   yarn
   ```

5. Build the installer:

   ```
   yarn dist
   ```

   This makes `dist\ForkdeskSetup-x64.exe` and `dist\ForkdeskSetup-x64.msi`.
   Without a certificate the installer isn't signed, so Windows SmartScreen
   warns the first time.

To work on Forkdesk itself, run the development version instead:

```
yarn build:dev
yarn start
```

The development version is called Forkdesk-dev and keeps its own settings,
sign-ins and repositories, apart from the installed Forkdesk.

### Releases and updates

Installed Forkdesk updates itself from the latest release of this repository.
To publish a release:

1. Add the `DESKTOP_OAUTH_CLIENT_ID` and `DESKTOP_OAUTH_CLIENT_SECRET` secrets
   of the OAuth app to the repository, under Settings > Secrets and variables >
   Actions, and enable Actions for the repository.
2. Raise `version` in `app/package.json` and commit it.
3. Push a tag for that version. The message of an annotated tag becomes the
   release notes, with lines like `[New] Something` or `[Fixed] Something`:

   ```
   git tag -a v3.6.11 -m "[New] Something"
   git push origin v3.6.11
   ```

The [release workflow](.github/workflows/forkdesk-release.yml) then builds the
installer and publishes it as a release.

To sign the installer, add a code signing certificate as the
`FORKDESK_CERTIFICATE_BASE64` secret (a base64 encoded `.pfx`) and its
password as `FORKDESK_CERTIFICATE_PASSWORD`. Locally, `yarn dist` signs with
the `.pfx` in the `FORKDESK_CERTIFICATE_FILE` environment variable.

### Icons

All icons are generated from [`app/static/logos/logo.svg`](app/static/logos/logo.svg)
with `yarn icons`, which uses the Edge or Chrome on your machine. A macOS build
also needs `Assets.car`, which `script/compile-macos-icons.sh` compiles on a Mac
with Xcode 26.

## Roadmap

What's done, the known limitations and ideas for later are in the
[roadmap](docs/forkdesk/roadmap.md).

## Relation to GitHub Desktop

Forkdesk follows GitHub Desktop's `development` branch, which is set up as the
`upstream` remote. Changes from GitHub Desktop can be merged from there.
Forkdesk uses its own name, logo, protocols and OAuth app, so it runs next to
GitHub Desktop without getting in its way. It updates from its own releases
instead of GitHub's update server, and doesn't send usage statistics.

Problems with Forkdesk shouldn't be reported to GitHub Desktop. The
[documentation of GitHub Desktop](https://docs.github.com/en/desktop) does
apply to everything Forkdesk didn't change.

## License

**[MIT](LICENSE)**, like GitHub Desktop.

The MIT license doesn't cover GitHub's trademarks, such as the GitHub name and
the Invertocat logo. Forkdesk doesn't use them as its own: its name and logo
are its own.
