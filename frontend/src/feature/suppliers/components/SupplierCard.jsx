/**
 * Tarjeta de presentación de proveedor o taller de confección.
 * Responsable: Zully
 */
import {
  Building2,
  User,
  Phone,
  Mail,
  FileText,
  MapPin,
  Tag,
  PackagePlus,
  Pencil,
  MessageCircle,
} from 'lucide-react';

export const SupplierCard = ({ supplier, onEdit, onRestock }) => {
  const getWhatsAppLink = (phone) => {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;
    const text = encodeURIComponent(
      `Hola ${supplier.contactName || supplier.companyName}, te saludamos de Tienda Prisma para coordinar un pedido de reposición de mercadería.`
    );
    return `https://wa.me/${phoneWithCountry}?text=${text}`;
  };

  const isMobile = (phone) => {
    const clean = (phone || '').replace(/\D/g, '');
    return clean.length === 9 && clean.startsWith('9');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-gray-300 transition-all duration-200 ease-out flex flex-col justify-between group">
      {/* Cabecera de la tarjeta */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gray-900 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
              {supplier.companyName ? supplier.companyName.slice(0, 2).toUpperCase() : 'PR'}
            </div>
            <div>
              <h3 className="font-bold text-gray-950 text-sm leading-snug m-0 group-hover:text-black">
                {supplier.companyName}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                <User size={12} className="text-gray-400" />
                <span>{supplier.contactName || 'Contacto directo'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onEdit && onEdit(supplier)}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer shrink-0"
            title="Editar proveedor"
          >
            <Pencil size={13} />
          </button>
        </div>

        {/* Línea de suministro y RUC */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="badge badge-neutral text-xs py-0.5">
            <Tag size={11} className="mr-1" />
            {supplier.productsSupplied || 'General'}
          </span>
          {supplier.taxId && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
              <FileText size={11} className="text-gray-400" />
              RUC: {supplier.taxId}
            </span>
          )}
        </div>

        {/* Canales de contacto */}
        <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
          {/* Teléfono y WhatsApp */}
          <div className="flex items-center justify-between">
            <a
              href={`tel:${supplier.phone}`}
              className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-950 font-medium no-underline transition-colors"
            >
              <Phone size={13} className="text-gray-400" />
              <span>{supplier.phone}</span>
            </a>
            {isMobile(supplier.phone) && (
              <a
                href={getWhatsAppLink(supplier.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 font-bold text-[11px] no-underline transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                title="Escribir al WhatsApp del proveedor"
              >
                <MessageCircle size={12} />
                <span>WhatsApp</span>
              </a>
            )}
          </div>

          {/* Correo */}
          {supplier.email && (
            <a
              href={`mailto:${supplier.email}`}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 no-underline truncate transition-colors"
            >
              <Mail size={13} className="text-gray-400 shrink-0" />
              <span className="truncate">{supplier.email}</span>
            </a>
          )}

          {/* Dirección o stand */}
          {supplier.address && (
            <div className="flex items-start gap-2 text-gray-500 pt-0.5">
              <MapPin size={13} className="text-gray-400 shrink-0 mt-0.5" />
              <span className="line-clamp-2 leading-relaxed text-[11px]">
                {supplier.address}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Pie de tarjeta: botón de reabastecimiento */}
      <div className="pt-4 mt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={() => onRestock && onRestock(supplier)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] shadow-xs cursor-pointer border-none select-none"
        >
          <PackagePlus size={14} />
          <span>Reponer Mercadería</span>
        </button>
      </div>
    </div>
  );
};
