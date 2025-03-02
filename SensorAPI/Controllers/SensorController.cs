using Microsoft.AspNetCore.Mvc;
using SensorAPI.Data;
using SensorAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace SensorAPI.Controllers
{
    [Route("api/sensor")]
    [ApiController]
    public class SensorController : ControllerBase
    {
        private readonly SensorDbContext _context;
        private static List<SensorData> _buffer = new List<SensorData>();

        public SensorController(SensorDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> SaveSensorData([FromBody] SensorData data)
        {
            if (data == null) return BadRequest("Invalid data");

            // Store in buffer
            _buffer.Add(data);

            if (_buffer.Count == 3) // Process every 3 readings
            {
                var avgTemperature = _buffer.Average(d => d.Temperature);
                var avgHumidity = _buffer.Average(d => d.Humidity);
                var avgMoisture = _buffer.Average(d => d.MoisturePercent);
                var avgStatus = avgMoisture > 30 ? "Wet" : "Dry";

                var averagedData = new SensorData
                {
                    Temperature = avgTemperature,
                    Humidity = avgHumidity,
                    MoisturePercent = avgMoisture,
                    SoilStatus = avgStatus,
                    Timestamp = DateTime.UtcNow
                };

                _context.SensorData.Add(averagedData);
                await _context.SaveChangesAsync();

                // Broadcast to WebSocket clients
                await SensorWebSocketController.BroadcastData(averagedData);

                _buffer.Clear(); // Reset buffer
            }

            return Ok(new { message = "Data received" });
        }

        [HttpGet]
        public async Task<IActionResult> GetLatestSensorData()
        {
            var latestData = await _context.SensorData.OrderByDescending(d => d.Timestamp).FirstOrDefaultAsync();
            return Ok(latestData);
        }
    }
}
