#!/bin/bash
# Script para corregir los routers restantes

# Corregir partners.router.ts
sed -i '0,/\.query(async ({ input, ctx }) => {/s//\.query(async ({ input, ctx }) => {\n    const db = await getDb();\n    if (!db) throw new Error('\''Database not available'\'');/' server/routers/partners.router.ts
sed -i '0,/\.mutation(async ({ input, ctx }) => {/s//\.mutation(async ({ input, ctx }) => {\n    const db = await getDb();\n    if (!db) throw new Error('\''Database not available'\'');/' server/routers/partners.router.ts

# Corregir technicianMetrics.router.ts
sed -i '0,/\.query(async ({ input, ctx }) => {/s//\.query(async ({ input, ctx }) => {\n    const db = await getDb();\n    if (!db) throw new Error('\''Database not available'\'');/' server/routers/technicianMetrics.router.ts

echo "Routers corregidos"
