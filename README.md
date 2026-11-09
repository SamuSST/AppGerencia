# Portal de Gerencia · Grupo Cardisel

Prototipo de aplicación web para los gerentes de los CDAs del Grupo Cardisel: informes y gráficos por CDA y comparativos entre los seis CDAs del grupo (La 37, Inteco, ITAC Norte, ITAC Sur, Tecnosabana y Unimilenio). Vista principal: **2026 vs 2025 a septiembre** y cumplimiento frente al cierre 2025; vista alterna: cierre 2025 vs 2024.

**Ver en línea:** https://samusst.github.io/AppGerencia/

## Pantallas
- **Resumen del grupo:** totales, evolución mensual y ranking de CDAs.
- **Ficha por CDA:** ingresos, EBITDA, resultado, estructura de gastos, servicios y estado de resultados.
- **Comparar CDAs:** cualquier indicador, 2025 vs 2024, contra el promedio del grupo.
- **Informes:** exportación a CSV / PDF y participación de cada CDA.
- **Carga de datos:** carga de Excel (simulada en este prototipo).

## Desarrollo
```bash
npm install
npm run dev
```

Cada push a `main` se publica automáticamente en GitHub Pages (`.github/workflows/deploy.yml`).

## Datos
Los datos están en `src/app/data/cardisel.ts`, extraídos de los Mapa Tipo de cada CDA. Las finanzas de ITAC vienen juntas en el Excel y se reparten entre Norte y Sur según el % de servicios de cada sede (se marcan como estimadas en la app).
