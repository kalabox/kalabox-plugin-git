# docker build -t kalabox/git .

FROM kalabox/debian:stable

RUN \
  apt-get update && \
  apt-get install -y git-core nano && \
  apt-get clean -y && \
  mkdir -p /usr/local/bin && \
  mkdir -p /root/.ssh

COPY kgit /usr/local/bin/kgit
COPY ssh-config /root/.ssh/config
COPY gitconfig /root/.gitconfig

RUN chmod +x /usr/local/bin/kgit

WORKDIR /data
ENTRYPOINT ["/usr/local/bin/kgit"]
