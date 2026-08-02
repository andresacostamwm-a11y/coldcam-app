# 📲 Regla permanente: aviso por WhatsApp en cada publicación

**Regla (indicada por Andrés):** cada vez que se suba CUALQUIER contenido a
Instagram — carrusel, publicación simple, historia, Reel o video — se le debe
enviar automáticamente un mensaje de WhatsApp confirmando que ya está publicado.

## Destinatario

- **+52 222 176 5406** (WhatsApp de Andrés)
- Conexión Zapier: "WhatsApp Notifications" (`WhatsAppNotificationsCLIAPI`)

## Cómo se envía

```
execute_zapier_write_action
  selected_api: WhatsAppNotificationsCLIAPI
  action: send_message
  tool_name: whatsapp_notifications_send_message
  params:
    template: "message_reminder"
    name: "✅ PUBLICADO en Instagram — <fecha>: <título> · <tipo de contenido> ya está en vivo"
    link_to_reply: "<permalink del post>"
```

El permalink se obtiene con:
`GET https://graph.facebook.com/v21.0/<id_del_post>?fields=id,permalink`

## Orden obligatorio en cada publicación

1. Publicar el contenido en Instagram (Zapier → Instagram for Business).
2. Verificar que se publicó (permalink).
3. **Enviar el WhatsApp** con el enlace.
4. Confirmar también en el chat.

## Manejo del error de cuota

Si Zapier responde `insufficient tasks on account`, las tareas del plan se
agotaron. En ese caso NO reintentar en bucle: avisar a Andrés en el chat
indicando exactamente qué se publicó y qué no, y que debe reponer tareas en
zapier.com → Settings → Usage.

**Nota:** la publicación en Instagram también consume tareas de Zapier, así que
si la cuota se agota, tanto la publicación como el aviso quedan bloqueados.
