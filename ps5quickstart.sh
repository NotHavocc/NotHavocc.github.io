#!/usr/bin/env bash
# welcome to install script phonk brother

REPO_URL="https://github.com/NotHavocc/ps5-linux-quickstart.git"
DEFAULT_BRANCH="main"
APP_FILE="ps5_quickstart.py"

if [ -t 1 ]; then BOLD=$'\033[1m' YELLOW=$'\033[33m' RED=$'\033[31m' RESET=$'\033[0m'
else BOLD="" YELLOW="" RED="" RESET=""; fi
say() { printf '%s==>%s %s\n' "$BOLD" "$RESET" "$*"; }
warn() { printf '%sWarning:%s %s\n' "$YELLOW" "$RESET" "$*" >&2; }
die() { printf '%sError:%s %s\n' "$RED" "$RESET" "$*" >&2; exit 1; }

as_root() {
    if [ "$(id -u)" -eq 0 ]; then
        "$@"
    else
        sudo "$@"
    fi
}

check_system() {
    [ "$(uname -s)" = Linux ] || die "PS5 Linux QuickStart runs on Linux (found $(uname -s))."
    command -v apt-get >/dev/null 2>&1 \
        || die "apt-get not found: PS5 Linux QuickStart needs a Debian/Ubuntu based system."
    if [ -z "${DISPLAY:-}" ] && [ -z "${WAYLAND_DISPLAY:-}" ]; then
        die "No graphical session found. Run this from a terminal on the PS5 desktop."
    fi
    if [ "$(id -u)" -eq 0 ] && [ -z "${SUDO_USER:-}" ]; then
        warn "Running as root. Start it as your normal user instead so the wizard sets up your account."
    fi
}

install_dependencies() {
    local missing=()
    command -v git >/dev/null 2>&1 || missing+=(git)
    command -v python3 >/dev/null 2>&1 || missing+=(python3)
    if ! python3 -c 'import PyQt6.QtWidgets' >/dev/null 2>&1; then
        missing+=(python3-pyqt6)
    fi
    command -v pkexec >/dev/null 2>&1 || missing+=(pkexec)

    if [ "${#missing[@]}" -eq 0 ]; then
        return
    fi
    say "Installing: ${missing[*]}"
    as_root apt-get update -o DPkg::Lock::Timeout=300
    as_root apt-get install -y -o DPkg::Lock::Timeout=300 "${missing[@]}"
}

fetch_latest() {
    local repo="$1" branch="$2" dir="$3"

    if [ -d "$dir/.git" ]; then
        local current
        current="$(git -C "$dir" remote get-url origin 2>/dev/null || true)"
        if [ "$current" != "$repo" ]; then
            die "$dir is a copy of $current, not $repo. Remove it or set PS5QS_DIR."
        fi
        say "Updating PS5 Linux QuickStart in $dir"
        git -C "$dir" fetch --quiet --depth 1 origin "$branch" \
            || die "Could not download $branch from $repo."
        git -C "$dir" reset --hard --quiet FETCH_HEAD
    elif [ -e "$dir" ]; then
        die "$dir exists but is not a PS5 Linux QuickStart download. Remove it or set PS5QS_DIR."
    else
        say "Downloading PS5 Linux QuickStart to $dir"
        mkdir -p "$(dirname "$dir")"
        git clone --quiet --depth 1 --branch "$branch" "$repo" "$dir" \
            || die "Could not download $branch from $repo."
    fi
    say "Version: $(git -C "$dir" log -1 --format='%h (%cd)' --date=short)"
}

main() {
    set -euo pipefail

    local repo="${PS5QS_REPO:-$REPO_URL}"
    local branch="${PS5QS_BRANCH:-$DEFAULT_BRANCH}"
    local home="$HOME"
    if [ "$(id -u)" -eq 0 ] && [ -n "${SUDO_USER:-}" ]; then
        home="$(getent passwd "$SUDO_USER" | cut -d: -f6)"
    fi
    local dir="${PS5QS_DIR:-${XDG_DATA_HOME:-$home/.local/share}/ps5-quickstart}"

    case "$repo" in
        *CHANGE-ME*) die "The repository URL has not been set yet (REPO_URL in install.sh, or PS5QS_REPO)." ;;
    esac

    check_system
    install_dependencies
    fetch_latest "$repo" "$branch" "$dir"

    [ -f "$dir/$APP_FILE" ] || die "$APP_FILE not found in the download ($dir)."
    say "Starting PS5 Linux QuickStart"
    if { : </dev/tty; } 2>/dev/null; then
        exec python3 "$dir/$APP_FILE" "$@" </dev/tty
    fi
    exec python3 "$dir/$APP_FILE" "$@"
}

main "$@"
