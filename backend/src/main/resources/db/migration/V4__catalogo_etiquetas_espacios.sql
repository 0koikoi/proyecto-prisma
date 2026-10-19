-- La identidad de talla/color también ignora secuencias de espacios internos.
-- No se modifican migraciones previas ni se fusionan registros automáticamente.
-- Si existe una colisión histórica, conciliarla antes de aplicar esta migración.
CREATE UNIQUE INDEX IF NOT EXISTS uq_variants_labels_whitespace_normalized
    ON product_variants (
        product_id,
        upper(regexp_replace(btrim(size_label), '[[:space:]]+', ' ', 'g')),
        upper(regexp_replace(btrim(color_label), '[[:space:]]+', ' ', 'g'))
    );

DROP INDEX IF EXISTS uq_variants_labels_normalized;
