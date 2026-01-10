import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear PNG válido de 192x192 (1x1 transparent PNG for now)
// En producción, generar desde SVG con sharp o similar
const png192Base64 = 'iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAACXBIWXMAACE4AAAhOAHaJGcTAAACrUlEQVR4nO3YwYkbMRQAUIpMCDkEkkoqKSSQQiqpxBCy8AUXXMiBvOEBt/AKV/AKB3iBK1zBK3zhClBmwREq0Gw2M/v29s3M25nv8RAMGCi/n/Q/kgEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPCf3G63Wy6Xy/V6PT/n8/l8Op3O5/N5v9+f0+n0er2eL5fL9Xo9n8/n93q9ns/n81vGcRyvr6/n9Xo9n8/n7/n6+nq+3W6Xy+X6er1+1/j9fj+fz+fv+f39PT8+Pm63W7XbbbZarcoyeF1VFXVDT05OqtoNtFqtUtM0VZZlVZZlVVmWVZqmVRgG6ro+XO/3+33g/ePjwy52XU8oGIaHKIqoKIqs67JsGIaoKAqKxWKzqVarVRaL5VFUHBZ1p9MJ4XFxl88x8VjUV1dXoXA4HMwdpmnKIkkSKhKJwDgfDweFYv3jZscXV6S0LCtu27b3eX2+KxzjdTrMlx3rNdxOpxOvk2G+6thvcVwuF9Pz+TyIZx3L/+BYrymew+EA5zz2+dZhuHRdF8SBgLk99xzf/PqCqfh+v8+7X9wkEpF9m82G9/t9EC3L4n2/34fxfr/PfT6fFQrj8Zg7HpfL5XoBoA+XyPPb7XY5Ho85/fu9Xy6XF45JWZQdx+Nl4/xKLpfL5X+6RB4Jg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAY/gON/PK0SLiR0wAAAABJRU5ErkJggg==';
const png512Base64 = 'iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAABccqhmAAAACXBIWXMAACE4AAAhOAHaJGcTAAACrUlEQVR4nO3YwYkbMRQAUIpMCDkEkkoqKSSQQiqpxBCy8AUXXMiBvOEBt/AKV/AKB3iBK1zBK3zhClBmwREq0Gw2M/v29s3M25nv8RAMGCi/n/Q/kgEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPCf3G63Wy6Xy/V6PT/n8/l8Op3O5/N5v9+f0+n0er2eL5fL9Xo9n8/n93q9ns/n81vGcRyvr6/n9Xo9n8/n7/n6+nq+3W6Xy+X6er1+1/j9fj+fz+fv+f39PT8+Pm63W7XbbbZarcoyeF1VFXVDT05OqtoNtFqtUtM0VZZlVZZlVVmWVZqmVRgG6ro+XO/3+33g/ePjwy52XU8oGIaHKIqoKIqs67JsGIaoKAqKxWKzqVarVRaL5VFUHBZ1p9MJ4XFxl88x8VjUV1dXoXA4HMwdpmnKIkkSKhKJwDgfDweFYv3jZscXV6S0LCtu27b3eX2+KxzjdTrMlx3rNdxOpxOvk2G+6thvcVwuF9Pz+TyIZx3L/+BYrymew+EA5zz2+dZhuHRdF8SBgLk99xzf/PqCqfh+v8+7X9wkEpF9m82G9/t9EC3L4n2/34fxfr/PfT6fFQrj8Zg7HpfL5XoBoA+XyPPb7XY5Ho85/fu9Xy6XF45JWZQdx+Nl4/xKLpfL5X+6RB4Jg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAYDAaDwWAwGAwGg8FgMBgMBoPBYDAY/gON/PK0SLiR0wAAAABJRU5ErkJggg==';

// Escribir archivos
fs.writeFileSync(
  path.join(__dirname, '../public/icon-192.png'),
  Buffer.from(png192Base64, 'base64')
);

fs.writeFileSync(
  path.join(__dirname, '../public/icon-512.png'),
  Buffer.from(png512Base64, 'base64')
);

// Por ahora, copiar los mismos para maskable (en producción, crear versiones sin bordes)
fs.writeFileSync(
  path.join(__dirname, '../public/icon-192-maskable.png'),
  Buffer.from(png192Base64, 'base64')
);

fs.writeFileSync(
  path.join(__dirname, '../public/icon-512-maskable.png'),
  Buffer.from(png512Base64, 'base64')
);

console.log('✓ Iconos PWA generados correctamente');
