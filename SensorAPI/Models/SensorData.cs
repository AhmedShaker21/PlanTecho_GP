using System;
using System.ComponentModel.DataAnnotations;

namespace SensorAPI.Models
{
    public class SensorData
    {
        [Key]
        public int Id { get; set; }
        public double Temperature { get; set; }
        public double Humidity { get; set; }
        public double MoisturePercent { get; set; }
        public string SoilStatus { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
