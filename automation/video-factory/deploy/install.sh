#!/usr/bin/env bash
# Install / update the video factory on the Contabo VPS (phase 0). Run as root ON THE SERVER:
#   bash /opt/video-factory/src/deploy/install.sh
# Before the first run, copy the code to /opt/video-factory/src (see README «النشر»), and create
#   /opt/video-factory/.env           (chmod 600) — names in deploy/env.example
#   /opt/video-factory/secrets/       (chmod 700) — youtube_oauth_client.json + youtube_token.json (chmod 600)
# What this touches on the host: /opt/video-factory, the docker image vf-factory, /etc/cron.d/video-factory.
# It installs NO packages on the host and does not touch WAHA, content-radar or football.
set -euo pipefail
ROOT=/opt/video-factory
mkdir -p "$ROOT"/{work,logs,publish,secrets}
chmod 700 "$ROOT/secrets"
[ -f "$ROOT/.env" ] && chmod 600 "$ROOT/.env"
chmod 600 "$ROOT"/secrets/*.json 2>/dev/null || true

docker build -t vf-factory "$ROOT/src"

RUN="docker run --rm --cpus 2 --memory 3g --env-file $ROOT/.env -v $ROOT:/data -v $ROOT/secrets:/root/.modonty-video vf-factory"
cat > /etc/cron.d/video-factory <<EOF
# video factory — see /opt/video-factory/src/README.md (remove this file to stop the factory)
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
CRON_TZ=Asia/Riyadh
5 * * * *    root flock -n /tmp/vf-watch.lock   $RUN --watch   >> $ROOT/logs/watch.log 2>&1
*/15 * * * * root flock -n /tmp/vf-work.lock    nice -n 10 $RUN --work >> $ROOT/logs/work.log 2>&1
*/5 * * * *  root flock -n /tmp/vf-publish.lock $RUN --publish >> $ROOT/logs/publish.log 2>&1
EOF
chmod 644 /etc/cron.d/video-factory
echo "installed: image $(docker images vf-factory --format '{{.Size}}'), cron /etc/cron.d/video-factory"
