using Microsoft.EntityFrameworkCore;
using SensorAPI.Models;

namespace SensorAPI.Data
{
    public class SensorDbContext : DbContext
    {
        public SensorDbContext(DbContextOptions<SensorDbContext> options) : base(options) { }

        public DbSet<SensorData> SensorData { get; set; }
    }
}
