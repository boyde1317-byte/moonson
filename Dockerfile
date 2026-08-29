FROM node:20-slim

# ── System deps ──
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    git ffmpeg python3 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ── Force git over HTTPS (no SSH available in slim image) ──
RUN git config --global url."https://github.com/".insteadOf ssh://git@github.com/ && \
    git config --global url."https://github.com/".insteadOf git@github.com:

WORKDIR /app

# ── Install dependencies ──
COPY package.json ./
RUN npm install --omit=dev

# ── Copy source ──
COPY . .

# ── Ensure directories exist ──
RUN mkdir -p state database

# ── Startup ──
RUN chmod +x railway-start.sh
CMD ["./railway-start.sh"]
