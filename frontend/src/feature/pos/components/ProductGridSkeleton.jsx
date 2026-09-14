/**
 * RESPONSABLE: Leo
 * MÓDULO: Punto de Venta (POS) — Esqueleto de Carga del Catálogo
 *
 * Se muestra mientras `useInventory` resuelve el catálogo (loading === true),
 * en vez de un panel en blanco. Reproduce la misma cuadrícula auto-ajustable
 * de ProductGrid para que no haya un "salto" de layout al llegar los datos.
 */
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const SkeletonCard = () => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between">
    <div>
      <div className="flex items-center justify-between mb-2">
        <Skeleton width={60} height={16} borderRadius={999} />
        <Skeleton width={40} height={14} />
      </div>
      <Skeleton height={16} className="mb-1" />
      <Skeleton width="70%" height={12} className="mb-3" />
    </div>
    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
      <Skeleton width={70} height={20} />
      <Skeleton width={28} height={28} borderRadius={8} />
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
    <div className="grid grid-cols-[repeat(auto-fill,minmax(155px,1fr))] gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </SkeletonTheme>
);
