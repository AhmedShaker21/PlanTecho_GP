using Microsoft.AspNetCore.Mvc;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using SensorAPI.Data;
using SensorAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace SensorAPI.Controllers
{
    [Route("ws/sensor")]
    public class SensorWebSocketController : ControllerBase
    {
        private static List<WebSocket> _clients = new List<WebSocket>();
        private readonly SensorDbContext _context;

        public SensorWebSocketController(SensorDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task Get()
        {
            if (HttpContext.WebSockets.IsWebSocketRequest)
            {
                using WebSocket webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
                _clients.Add(webSocket);

                await ReceiveMessages(webSocket);
            }
            else
            {
                HttpContext.Response.StatusCode = 400;
            }
        }

        private async Task ReceiveMessages(WebSocket webSocket)
        {
            var buffer = new byte[1024 * 4];

            while (webSocket.State == WebSocketState.Open)
            {
                var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                if (result.MessageType == WebSocketMessageType.Close)
                {
                    _clients.Remove(webSocket);
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed", CancellationToken.None);
                }
            }
        }

        public static async Task BroadcastData(SensorData data)
        {
            var jsonData = JsonSerializer.Serialize(data);
            var buffer = Encoding.UTF8.GetBytes(jsonData);

            foreach (var client in _clients)
            {
                if (client.State == WebSocketState.Open)
                {
                    await client.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
                }
            }
        }
    }
}
