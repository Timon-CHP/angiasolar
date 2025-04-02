
# Stage 1: Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Cài đặt pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package.json và pnpm-lock.yaml trước để tối ưu cache layer
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy toàn bộ mã nguồn và build Next.js
COPY . .
# Build with environment variables
RUN pnpm build

# Stage 2: Runtime Stage
FROM node:22-alpine

WORKDIR /app

# Cài đặt pnpm (cho runtime container)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy production dependencies và mã nguồn đã build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copy .env file if it exists (for local development)
COPY --from=builder /app/.env* ./ 
COPY --from=builder /app/.env* ./ 

# Create entrypoint script as a separate file instead of using echo
RUN printf '#!/bin/sh\n\
	# Create .env from environment variables if not exists\n\
	if [ ! -f .env ]; then\n\
	echo "Creating .env from environment variables"\n\
	env | grep "NEXT_PUBLIC_\\|TELEGRAM_" > .env\n\
	fi\n\
	\n\
	# Start the application\n\
	exec pnpm start\n' > /app/entrypoint.sh 

# Make sure the script is executable and has proper line endings
RUN chmod +x /app/entrypoint.sh && \
	dos2unix /app/entrypoint.sh 2>/dev/null || true


EXPOSE 3000

# Use the entrypoint script instead of directly running the app
CMD ["/bin/sh", "/app/entrypoint.sh"]