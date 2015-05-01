Kalabox Git
===================

A simple plugin to add git commands to your apps.

```

# docker build -t kalabox/git .

FROM kalabox/debian:stable

RUN \
  apt-get update && \
  apt-get install -y git-core && \
  apt-get clean -y && \
  mkdir -p /usr/local/bin && \
  mkdir -p /root/.ssh

COPY kgit /usr/local/bin/kgit
COPY ssh-config /root/.ssh/config

RUN chmod +x /usr/local/bin/kgit

ENTRYPOINT ["/usr/local/bin/kgit"]


```
