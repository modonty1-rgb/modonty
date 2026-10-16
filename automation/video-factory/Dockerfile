# Production image for the video factory on the Contabo VPS (phase 0, decision D22).
# Everything the factory needs lives in the image — nothing is installed on the host.
# Secrets are never baked in: they come at run time with --env-file /opt/video-factory/.env
# and the mount /opt/video-factory/secrets → /root/.modonty-video (YouTube client + token).
FROM python:3.12-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends ffmpeg chromium fonts-dejavu-core ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && pip install --no-cache-dir pillow==11.0.0
ENV CHROME_BIN=/usr/bin/chromium PYTHONIOENCODING=utf-8 VF_DATA=/data TZ=Asia/Riyadh
COPY . /engine
WORKDIR /data
ENTRYPOINT ["python", "/engine/factory.py"]
CMD ["--status"]
