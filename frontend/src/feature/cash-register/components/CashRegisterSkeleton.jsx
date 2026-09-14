/**
 * RESPONSABLE: Leo
 * MÓDULO: Caja y Arqueo Diario — Esqueleto de Carga
 *
 * Se muestra mientras `useCashRegister` resuelve el estado de la caja
 * (loading === true), en vez de un `return null` que deja la pantalla en
 * blanco un instante. Reproduce la misma estructura de la página real
 * (banner de turno + 4 tarjetas de método de pago + resumen) para que no
 * haya salto de layout al llegar los datos.
 */
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export const CashRegisterSkeleton = () => (
  <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
    <div className="page-container">
      <div className="page-header flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div>
          <Skeleton width={220} height={28} className="mb-2" />
          <Skeleton width={280} height={16} />
        </div>
        <div className="flex gap-3">
          <Skeleton width={130} height={40} borderRadius={8} />
          <Skeleton width={130} height={40} borderRadius={8} />
        </div>
      </div>

      <Skeleton height={76} borderRadius={12} />

      <div>
        <Skeleton width={220} height={18} className="mb-3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="content-card flex items-start gap-3">
              <Skeleton circle width={40} height={40} />
              <div className="flex-1">
                <Skeleton width="70%" height={12} className="mb-1.5" />
                <Skeleton width="50%" height={18} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Skeleton height={110} borderRadius={12} />
    </div>
  </SkeletonTheme>
);
