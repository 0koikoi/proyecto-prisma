package com.prisma.api.application.sale.mapper;

import com.prisma.api.domain.entities.ProductVariant;

/** Nombre mostrable de una variante: modelo y, si aplica, talla y color. */
public final class VariantLabel {

    private static final String NO_SIZE = "UNICA";
    private static final String NO_COLOR = "SIN_COLOR";

    private VariantLabel() {
    }

    public static String of(ProductVariant variant) {
        String name = variant.getProduct().getName();
        boolean hasSize = !NO_SIZE.equalsIgnoreCase(variant.getSizeLabel());
        boolean hasColor = !NO_COLOR.equalsIgnoreCase(variant.getColorLabel());
        if (hasSize && hasColor) {
            return name + " — " + variant.getSizeLabel() + " / " + variant.getColorLabel();
        }
        if (hasSize) {
            return name + " — " + variant.getSizeLabel();
        }
        if (hasColor) {
            return name + " — " + variant.getColorLabel();
        }
        return name;
    }
}
