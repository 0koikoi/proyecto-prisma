-- No reescribir V1/V2: proteger la misma identidad normalizada que usa la API.
-- Si existe información histórica duplicada, conciliarla antes de aplicar esta migración;
-- esta migración no borra ni fusiona registros automáticamente.
CREATE UNIQUE INDEX IF NOT EXISTS uq_categories_name_normalized
    ON categories (lower(btrim(name)));

CREATE UNIQUE INDEX IF NOT EXISTS uq_variants_sku_normalized
    ON product_variants (upper(btrim(sku)));

CREATE UNIQUE INDEX IF NOT EXISTS uq_variants_labels_normalized
    ON product_variants (product_id, upper(btrim(size_label)), upper(btrim(color_label)));

CREATE UNIQUE INDEX IF NOT EXISTS uq_variants_barcode_normalized
    ON product_variants (btrim(barcode)) WHERE barcode IS NOT NULL;
