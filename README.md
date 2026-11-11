# Brote Studio

Personalizador web para centros de jardinería. El asistente prepara las páginas, los submenús y el diseño a partir de los datos del centro, sus productos y sus servicios. Después puedes navegar por la propuesta y abrir el editor completo.

Abre `abrir-demo.html` para probar la demo en un solo archivo. Para trabajar sobre el código, ejecuta `Abrir-Brote.command` en macOS, `Abrir-Brote.bat` en Windows o este comando con Python 3.

```sh
python3 server.py
```

La primera visita abre el asistente. Si ya tienes un proyecto, vuelve a entrar desde **Más → Abrir configuración inicial**. El editor muestra la web como vista principal. Pulsa **Editar portada** o **Editar sección** para abrir su panel. **Páginas** reúne la estructura, **Estilo de la web** agrupa paletas y ajustes avanzados, y **Más** contiene el recorrido guiado y la exportación.

Los cambios se guardan en el navegador y puedes trasladar el proyecto exportando el JSON.

[Guía del asistente y pruebas realizadas](ASISTENTE.md) · [Créditos de los recursos](assets/ASSET_CREDITS.md)

Puedes comprobar la biblioteca de componentes con Node.

```sh
node pruebas/comprobar.mjs
```
