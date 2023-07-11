FROM python:3

# Avoid warnings by switching to noninteractive
ENV DEBIAN_FRONTEND=noninteractive

LABEL Name=web_bottle Version=0.0.1
EXPOSE 8080

COPY requirements.txt /tmp/pip-tmp/

# Configure apt and install packages
RUN apt-get update \
    && apt-get install -y --no-install-recommends apt-utils dialog 2>&1 \
    && apt-get install -y htop \
    #
    # Update Python environment based on requirements.txt
    && pip --disable-pip-version-check --no-cache-dir install -r /tmp/pip-tmp/requirements.txt \
    && rm -rf /tmp/pip-tmp \
    #
    # Clean up
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# Switch back to dialog for any ad-hoc use of apt-get
ENV DEBIAN_FRONTEND=dialog

ENV WORKERS=5

WORKDIR /app
ADD . /app

# uWSGI mode
ENTRYPOINT ["/bin/bash", "-c", "uwsgi --http :8080 --wsgi-file server.py --process $WORKERS --die-on-term --lazy-apps --enable-threads --thunder-lock"]

# WSGIRefServer mode
#CMD ["python", "server.py"]
