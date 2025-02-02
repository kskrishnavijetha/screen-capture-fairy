import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { headers } = req
  const upgradeHeader = headers.get('upgrade') || ''

  if (upgradeHeader.toLowerCase() !== 'websocket') {
    return new Response('Expected WebSocket connection', { status: 400 })
  }

  const { socket, response } = Deno.upgradeWebSocket(req)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )

  socket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data)
      
      if (data.type === 'annotation') {
        const { error } = await supabase
          .from('annotations_canvas')
          .insert({
            video_id: data.videoId,
            canvas_data: data.canvasData,
            created_by: data.userId
          })

        if (error) throw error
      }
    } catch (error) {
      console.error('Error processing message:', error)
    }
  }

  return response
})