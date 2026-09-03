using Microsoft.EntityFrameworkCore;
using UniReserve.Api.Models;

namespace UniReserve.Api.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(ApplicationDbContext db)
    {
        // Apply migrations / ensure database is created
        await db.Database.EnsureCreatedAsync();

        // Seed Users if not present
        if (!await db.Users.AnyAsync())
        {
            var adminUser = new User
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                FullName = "Campus Equipment Administrator",
                Email = "admin@university.edu",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Role = UserRole.Administrator,
                StudentId = "ADM-1001",
                Department = "Central IT & Lab Resources",
                PhoneNumber = "+1 (555) 019-2831",
                CreatedAt = DateTime.UtcNow
            };

            var studentUser1 = new User
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                FullName = "Alex Rivera",
                Email = "student@university.edu",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student@123"),
                Role = UserRole.Student,
                StudentId = "STU-2024-8842",
                Department = "Computer Science & Engineering",
                PhoneNumber = "+1 (555) 234-5678",
                CreatedAt = DateTime.UtcNow
            };

            var studentUser2 = new User
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                FullName = "Sarah Chen",
                Email = "sarah.chen@university.edu",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student@123"),
                Role = UserRole.Student,
                StudentId = "STU-2023-4120",
                Department = "Digital Media & Film Arts",
                PhoneNumber = "+1 (555) 876-5432",
                CreatedAt = DateTime.UtcNow
            };

            db.Users.AddRange(adminUser, studentUser1, studentUser2);
            await db.SaveChangesAsync();
        }

        // Seed Categories if not present
        if (!await db.Categories.AnyAsync())
        {
            var catLaptops = new Category
            {
                Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                Name = "Laptops & Workstations",
                Description = "High-performance laptops for engineering, AI model training, coding, and general computing.",
                IconName = "Laptop",
                DisplayOrder = 1,
                CreatedAt = DateTime.UtcNow
            };

            var catCameras = new Category
            {
                Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                Name = "Cameras & Video Gear",
                Description = "4K cinema cameras, mirrorless cameras, lenses, stabilizers, and lighting kits.",
                IconName = "Camera",
                DisplayOrder = 2,
                CreatedAt = DateTime.UtcNow
            };

            var catProjectors = new Category
            {
                Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"),
                Name = "Projectors & AV Displays",
                Description = "Portable HD/4K projectors, wireless presentation systems, and PA sound speakers.",
                IconName = "Tv",
                DisplayOrder = 3,
                CreatedAt = DateTime.UtcNow
            };

            var catLab = new Category
            {
                Id = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd"),
                Name = "Laboratory & Sensors",
                Description = "Digital oscilloscopes, multimeter kits, microcontrollers (Arduino/Raspberry Pi), and environmental sensors.",
                IconName = "Cpu",
                DisplayOrder = 4,
                CreatedAt = DateTime.UtcNow
            };

            var catAudioVR = new Category
            {
                Id = Guid.Parse("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"),
                Name = "Audio & VR Headsets",
                Description = "Meta Quest VR kits, podcast studio microphones, field audio recorders, and wireless lavaliers.",
                IconName = "Headphones",
                DisplayOrder = 5,
                CreatedAt = DateTime.UtcNow
            };

            db.Categories.AddRange(catLaptops, catCameras, catProjectors, catLab, catAudioVR);
            await db.SaveChangesAsync();
        }

        // Seed Equipment if not present
        if (!await db.Equipment.AnyAsync())
        {
            var catLaptopsId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
            var catCamerasId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
            var catProjectorsId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc");
            var catLabId = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd");
            var catAudioVRId = Guid.Parse("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee");

            var items = new List<Equipment>
            {
                new Equipment
                {
                    Id = Guid.Parse("10000000-0000-0000-0000-000000000001"),
                    Name = "Apple MacBook Pro 16\" (M3 Max / 36GB / 1TB)",
                    CategoryId = catLaptopsId,
                    AssetTag = "EQ-LAP-001",
                    ModelNumber = "MacBookPro18,1",
                    SerialNumber = "C02XYZ123ABC",
                    Description = "Top-tier MacBook Pro engineered for intensive iOS/macOS compilation, machine learning simulation, and 4K ProRes rendering. Includes 140W USB-C fast charger and carrying sleeve.",
                    Specifications = "{\"Processor\": \"Apple M3 Max (14-Core CPU, 30-Core GPU)\", \"RAM\": \"36 GB Unified\", \"Storage\": \"1 TB NVMe SSD\", \"Display\": \"16.2-inch Liquid Retina XDR (120Hz)\", \"Ports\": \"3x Thunderbolt 4, HDMI, SDXC, MagSafe 3\"}",
                    ImageUrl = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80",
                    Location = "Tech Hub - Station Desk A",
                    Status = EquipmentStatus.Available,
                    TotalQuantity = 5,
                    AvailableQuantity = 5,
                    MaxBorrowDays = 7,
                    TermsAndConditions = "Must be returned in original protective sleeve with MagSafe cable and 140W charger. User accounts are wiped upon return."
                },
                new Equipment
                {
                    Id = Guid.Parse("10000000-0000-0000-0000-000000000002"),
                    Name = "Dell XPS 15 (Core i9 / RTX 4070 / 32GB)",
                    CategoryId = catLaptopsId,
                    AssetTag = "EQ-LAP-002",
                    ModelNumber = "XPS-9530-I9",
                    SerialNumber = "DLXPS9530-994",
                    Description = "High-performance Windows engineering workstation preloaded with AutoCAD, SolidWorks, MATLAB, Visual Studio, and PyTorch CUDA drivers.",
                    Specifications = "{\"Processor\": \"Intel Core i9-13900H (14 Cores, up to 5.4 GHz)\", \"GPU\": \"NVIDIA GeForce RTX 4070 8GB GDDR6\", \"RAM\": \"32 GB DDR5 4800MHz\", \"Display\": \"15.6-inch 3.5K OLED Touchscreen\", \"OS\": \"Windows 11 Pro Education\"}",
                    ImageUrl = "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=80",
                    Location = "Engineering Block C - Lab 102",
                    Status = EquipmentStatus.Available,
                    TotalQuantity = 6,
                    AvailableQuantity = 6,
                    MaxBorrowDays = 14,
                    TermsAndConditions = "Pre-installed software must not be uninstalled. Backup all personal data before returning."
                },
                new Equipment
                {
                    Id = Guid.Parse("10000000-0000-0000-0000-000000000003"),
                    Name = "Sony Alpha A7 IV Mirrorless 4K Camera Kit",
                    CategoryId = catCamerasId,
                    AssetTag = "EQ-CAM-001",
                    ModelNumber = "ILCE-7M4K",
                    SerialNumber = "SNY-A7M4-3011",
                    Description = "33MP Full-Frame hybrid mirrorless camera with FE 24-70mm f/2.8 GM Lens, 2x 128GB V90 SD cards, 3x batteries, dual charger, and Pelican hard case.",
                    Specifications = "{\"Sensor\": \"33MP Full-Frame Exmor R CMOS\", \"Video\": \"4K 60p 10-Bit 4:2:2 All-Intra\", \"Stabilization\": \"5-Axis SteadyShot Inside\", \"Lens\": \"Sony FE 24-70mm f/2.8 GM\", \"Included\": \"Pelican 1510 case, 3 batteries, Rode VideoMic Pro+\"}",
                    ImageUrl = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80",
                    Location = "Media Center - Studio Equipment Vault",
                    Status = EquipmentStatus.Available,
                    TotalQuantity = 4,
                    AvailableQuantity = 4,
                    MaxBorrowDays = 3,
                    TermsAndConditions = "Valid camera handling workshop certification or faculty endorsement required before checkout."
                },
                new Equipment
                {
                    Id = Guid.Parse("10000000-0000-0000-0000-000000000004"),
                    Name = "Blackmagic Pocket Cinema Camera 6K Pro",
                    CategoryId = catCamerasId,
                    AssetTag = "EQ-CAM-002",
                    ModelNumber = "BMPCC-6K-PRO",
                    SerialNumber = "BMD-6KP-8812",
                    Description = "Super 35 HDR sensor camera with motorized internal ND filters, EF lens mount, Sigma 18-35mm f/1.8 lens, and 1TB Samsung T7 Shield SSD.",
                    Specifications = "{\"Resolution\": \"6144 x 3456 (6K) up to 50 fps\", \"Dynamic Range\": \"13 Stops with Dual Native ISO up to 25,600\", \"ND Filters\": \"Clear, 2-stop, 4-stop, 6-stop IR ND\", \"Audio\": \"2x Mini XLR inputs with 48V phantom power\"}",
                    ImageUrl = "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1000&q=80",
                    Location = "Media Center - Studio Equipment Vault",
                    Status = EquipmentStatus.Available,
                    TotalQuantity = 2,
                    AvailableQuantity = 2,
                    MaxBorrowDays = 3,
                    TermsAndConditions = "Must be inspected with equipment technician upon both pickup and return."
                },
                new Equipment
                {
                    Id = Guid.Parse("10000000-0000-0000-0000-000000000005"),
                    Name = "Epson Pro EX11000 Full HD 4K-Enhanced Laser Projector",
                    CategoryId = catProjectorsId,
                    AssetTag = "EQ-PRJ-001",
                    ModelNumber = "EX11000-LASER",
                    SerialNumber = "EPSN-PRJ-4491",
                    Description = "4,500 lumens high-brightness laser projector ideal for large lecture halls, student hackathon presentations, and outdoor thesis exhibitions.",
                    Specifications = "{\"Brightness\": \"4,500 Lumens (Color & White Output)\", \"Resolution\": \"Full HD 1080p with 4K Enhancement\", \"Lamp Life\": \"20,000 hours solid-state laser\", \"Connectivity\": \"Dual HDMI, USB-A, Wi-Fi Screen Mirroring\", \"Weight\": \"4.1 kg with rolling flight case\"}",
                    ImageUrl = "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1000&q=80",
                    Location = "Student Center - AV Operations Room",
                    Status = EquipmentStatus.Available,
                    TotalQuantity = 3,
                    AvailableQuantity = 3,
                    MaxBorrowDays = 2,
                    TermsAndConditions = "Power off and allow cooling cycle before packing into travel casing. Includes 15m HDMI cable and remote."
                },
                new Equipment
                {
                    Id = Guid.Parse("10000000-0000-0000-0000-000000000006"),
                    Name = "Rigol DS1054Z 4-Channel Digital Storage Oscilloscope",
                    CategoryId = catLabId,
                    AssetTag = "EQ-LAB-001",
                    ModelNumber = "DS1054Z-PLUS",
                    SerialNumber = "RGL-DS1054Z-5501",
                    Description = "50 MHz (upgradable to 100 MHz) 4-channel digital oscilloscope with 1 GSa/s sampling rate, 24 Mpts memory depth, and 4 high-voltage probes.",
                    Specifications = "{\"Channels\": \"4 Analog Channels\", \"Bandwidth\": \"50 MHz (1 GSa/s real-time sample rate)\", \"Memory Depth\": \"24 Mpts standard\", \"Waveform Capture\": \"Up to 30,000 wfms/s\", \"Included\": \"4x 150MHz passive probes, USB cable, ground clips\"}",
                    ImageUrl = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80",
                    Location = "Electrical Engineering Building - Room 304",
                    Status = EquipmentStatus.Available,
                    TotalQuantity = 8,
                    AvailableQuantity = 8,
                    MaxBorrowDays = 7,
                    TermsAndConditions = "Observe ESD grounding protocols when connecting to sensitive circuit prototypes."
                },
                new Equipment
                {
                    Id = Guid.Parse("10000000-0000-0000-0000-000000000007"),
                    Name = "Meta Quest 3 512GB VR Development Kit",
                    CategoryId = catAudioVRId,
                    AssetTag = "EQ-VR-001",
                    ModelNumber = "QUEST-3-512",
                    SerialNumber = "META-Q3-9901",
                    Description = "Next-gen mixed reality headset with high-res full-color passthrough, Touch Plus controllers, Elite strap with battery, and developer mode enabled.",
                    Specifications = "{\"Display\": \"4K+ Infinite Display (2064x2208 per eye)\", \"Processor\": \"Snapdragon XR2 Gen 2\", \"Storage\": \"512 GB\", \"Passthrough\": \"Dual RGB cameras with depth projector for mixed reality\", \"Battery\": \"Extended Elite Strap (up to 4.5 hours)\"}",
                    ImageUrl = "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=1000&q=80",
                    Location = "Interactive Media Lab - VR Hub",
                    Status = EquipmentStatus.Available,
                    TotalQuantity = 4,
                    AvailableQuantity = 4,
                    MaxBorrowDays = 5,
                    TermsAndConditions = "Sanitize silicone facial interface with provided medical wipes after use. Keep lenses away from direct sunlight."
                },
                new Equipment
                {
                    Id = Guid.Parse("10000000-0000-0000-0000-000000000008"),
                    Name = "Rode Wireless PRO Dual-Channel Mic System",
                    CategoryId = catAudioVRId,
                    AssetTag = "EQ-AUD-001",
                    ModelNumber = "WIPRO-DUAL",
                    SerialNumber = "RODE-WIPRO-7722",
                    Description = "Compact wireless microphone kit with 32-bit float on-board recording, timecode sync, 260m line-of-sight range, smart charging case, and Lavalier II mics.",
                    Specifications = "{\"Channels\": \"2 Transmitters + 1 Receiver\", \"Recording\": \"32-bit float on-board (over 40 hours internal storage)\", \"Range\": \"Up to 260m (850 ft) transmission\", \"Accessories\": \"2x Lavalier II microphones, magnetic clips, furry windshields, charging case\"}",
                    ImageUrl = "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80",
                    Location = "Podcast Studio - Tech Booth 2",
                    Status = EquipmentStatus.Available,
                    TotalQuantity = 6,
                    AvailableQuantity = 6,
                    MaxBorrowDays = 4,
                    TermsAndConditions = "Store transmitters inside charging dock when not in use. Return all magnetic clips and windscreens."
                }
            };

            db.Equipment.AddRange(items);
            await db.SaveChangesAsync();
        }

        // Seed Sample Reservations if not present
        if (!await db.Reservations.AnyAsync())
        {
            var studentId = Guid.Parse("22222222-2222-2222-2222-222222222222");
            var macbook = await db.Equipment.FirstOrDefaultAsync(e => e.AssetTag == "EQ-LAP-001");
            var camera = await db.Equipment.FirstOrDefaultAsync(e => e.AssetTag == "EQ-CAM-001");
            var vrKit = await db.Equipment.FirstOrDefaultAsync(e => e.AssetTag == "EQ-VR-001");

            if (macbook != null && camera != null && vrKit != null)
            {
                var now = DateTime.UtcNow;
                var resList = new List<Reservation>
                {
                    new Reservation
                    {
                        ReservationNumber = "RES-2026-1001",
                        UserId = studentId,
                        EquipmentId = macbook.Id,
                        StartDateTime = now.AddDays(-2),
                        EndDateTime = now.AddDays(4),
                        Quantity = 1,
                        Purpose = "Final Year AI Capstone - Deep learning model training & evaluation",
                        Notes = "Requires high compute capacity for PyTorch benchmarks.",
                        Status = ReservationStatus.CheckedOut,
                        CreatedAt = now.AddDays(-3),
                        ApprovedAt = now.AddDays(-2).AddHours(-4),
                        CheckedOutAt = now.AddDays(-2)
                    },
                    new Reservation
                    {
                        ReservationNumber = "RES-2026-1002",
                        UserId = studentId,
                        EquipmentId = camera.Id,
                        StartDateTime = now.AddDays(2),
                        EndDateTime = now.AddDays(5),
                        Quantity = 1,
                        Purpose = "Campus Documentary & Engineering Showcase Filming",
                        Notes = "Will need 2 extra batteries if available.",
                        Status = ReservationStatus.Approved,
                        CreatedAt = now.AddDays(-1),
                        ApprovedAt = now.AddHours(-6)
                    },
                    new Reservation
                    {
                        ReservationNumber = "RES-2026-1003",
                        UserId = studentId,
                        EquipmentId = vrKit.Id,
                        StartDateTime = now.AddDays(5),
                        EndDateTime = now.AddDays(8),
                        Quantity = 1,
                        Purpose = "Mixed Reality User Experience Study for HCI coursework",
                        Notes = "Conducting user testing in HCI Lab.",
                        Status = ReservationStatus.Pending,
                        CreatedAt = now.AddHours(-3)
                    }
                };

                db.Reservations.AddRange(resList);
                await db.SaveChangesAsync();
            }
        }
    }
}
