-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Sep 26, 2025 at 04:58 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `game_store`
--

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`id`, `user_id`, `created_at`) VALUES
(12, 22, '2025-09-23 14:48:30'),
(13, 23, '2025-09-23 15:39:16'),
(14, 24, '2025-09-23 18:08:40');

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(11) NOT NULL,
  `cart_id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cart_items`
--

INSERT INTO `cart_items` (`id`, `cart_id`, `game_id`, `quantity`) VALUES
(61, 12, 18, 1);

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`) VALUES
(1, 'Action'),
(2, 'Adventure'),
(4, 'Puzzle'),
(3, 'RPG'),
(5, 'Sports');

-- --------------------------------------------------------

--
-- Table structure for table `discount_codes`
--

CREATE TABLE `discount_codes` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `type` enum('percent','fixed') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `min_total` decimal(10,2) DEFAULT 0.00,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `usage_limit` int(11) DEFAULT NULL,
  `single_use_per_user` tinyint(1) DEFAULT 1,
  `active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `discount_codes`
--

INSERT INTO `discount_codes` (`id`, `code`, `type`, `value`, `min_total`, `start_date`, `end_date`, `usage_limit`, `single_use_per_user`, `active`, `created_at`) VALUES
(13, 'NEW100', 'percent', 100.00, 0.00, '2025-09-05', '2025-09-25', 1, 1, 1, '2025-09-23 17:14:45');

-- --------------------------------------------------------

--
-- Table structure for table `games`
--

CREATE TABLE `games` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `category_id` int(11) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `release_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `games`
--

INSERT INTO `games` (`id`, `name`, `price`, `category_id`, `image_url`, `description`, `release_date`) VALUES
(6, 'Assassin\'s Creed Shadows', 1999.00, 1, '/uploads/1758637478701-903046567.webp', 'สัมผัสประสบการณ์เรื่องราวแอ็คชั่นผจญภัยสุดยิ่งใหญ่ในยุคศักดินาของญี่ปุ่น! เล่นเป็นชิโนบิ นักฆ่ามือฉกาจและสุดยอดซามูไรในตำนาน พร้อมสำรวจโอเพ่นเวิลด์ที่สวยงามในช่วงเวลาแห่งความโกลาหล', '2003-01-19'),
(7, 'The Last of Us Part II Remastered', 1000.00, 1, '/uploads/1758559653655-483613544.jpg', 'The Last of Us Part II Remastered นำเรื่องราวของ Ellie และ Abby กลับมาสู่ PC ผ่าน Steam ในวันที่ 4 เมษายน 2025 เกมนี้พัฒนาโดย Naughty Dog และพอร์ตมาจากเวอร์ชัน PS5 ด้วยกราฟิกที่ได้รับการปรับปรุงและฟีเจอร์ใหม่ เช่น โหมด No Return ที่เป็นแนวเอาตัวรอดแบบสุ่ม และโหมด Guitar Free Play ผู้เล่นจะได้ผจญภัยในโลกหลังหายนะที่เต็มไปด้วยการต่อสู้และการตัดสินใจที่ส่งผลต่อเรื่องราว เกมนี้เป็นหนึ่งใน เกมผจญภัย Steam ที่เน้นการเล่าเรื่องและอารมณ์', '2222-02-22'),
(8, 'PayDay 2', 359.00, 1, '/uploads/1758559798681-705223149.webp', 'เกมนี้ต้องมีผู้เล่น 4 คนรวมตัวกันเพื่อปล้นธนาคารชิงเงินออกมาให้ได้ถ้าใครไม่อยากชวนเพื่อนเล่นก็สามารถเล่นกับ Ai ได้แต่ต้องบอกว่าประสบการณ์เล่นกับเพื่อนอาจจะสนุกกว่านะคะ เพราะมันจะฮา ยั่วอารมณ์ให้ได้ขำกันแน่นอน เกมนี้จะให้อารมณ์เหมือนเราอยู่ในหนังเรื่อง The Expandable เลยค่ะ สนุกมากกต้องลองเล่นเอง!', '2025-05-10'),
(9, 'Overcooked! 2', 79.99, 2, '/uploads/1758559974535-193159937.jpg', 'เกมทำอาหารสุดป่วน ซึ่งในเกมสามารถเล่นกับเพื่อนพร้อมกันได้ถึง 4 คน โดยวิธีการเล่นง่าย ๆ ไม่ซับซ้อนแต่หัวร้อนขั้นสุด แค่ช่วยกันทำอาหารเสิร์ฟลูกค้าให้ทันเวลา โดยสามารถแบ่งหน้าที่กันระหว่างฝ่ายต่าง ๆ  ฝ่ายเตรียมหุงอุ่นตุ๋นต้มนึ่ง ฝ่ายเสริม ฝ่ายล้างจาน แบบงานครัวจริง ๆ ซึ่งสามารถแบ่งงานกันทำได้ และในเกมจะเล่นเป็นด่าน แต่ละด่านก็จะมีเมนูแปลก ๆ เข้ามา รวมทั้งในด่านก็มีฉากที่เปลี่ยนไปไม่ซ้ำกัน เช่น ทำอาหารบนบอลลูน รางรถไฟ บ้านผีสิง สนุกแบบปั่นป่วนสมกับเป็นเกมพ่อครัวหัวร้อนจริง ๆ  ', '2025-06-20'),
(10, 'Black Myth: Wukong', 3999.00, 3, '/uploads/1758560260922-706686400.jpg', 'Black Myth: Wukong เป็นเกมแอ็กชัน RPG ที่สร้างจากตำนานเทพปกรณัมจีน เนื้อเรื่องอ้างอิงจากไซอิ๋ว หนึ่งในสี่นวนิยายคลาสสิกแห่งวรรณกรรมจีน ในฐานะผู้ถูกเลือก คุณจะได้ออกผจญภัยที่เต็มไปด้วยบททดสอบและสิ่งมหัศจรรย์ เพื่อเปิดเผยความลับของตำนานอันยิ่งใหญ่', '2025-07-05'),
(11, 'Grand Theft Auto VI', 543.00, 1, '/uploads/c3c77da1-5ef6-477b-95c5-35cb8ba170ae.webp', 'Grand Theft Auto VI คือเกมที่ทุกคนรอคอย หลังจากทิ้งช่วงถึง 11 ปีจากภาคก่อน เกมนี้พัฒนาโดย Rockstar Games และวางจำหน่ายในปี 2025 ผู้เล่นจะได้สำรวจเมือง Vice City และพื้นที่โดยรอบในโลก open-world ที่กว้างใหญ่ เรื่องราวเกี่ยวกับอาชญากรคู่หูที่ต้องเผชิญกับความท้าทายในโลกที่เต็มไปด้วยการทรยศและการต่อสู้ ด้วยกราฟิกที่สมจริงและอิสระในการเล่น GTA VI เป็นหนึ่งใน 10 เกมผจญภัย Steam ที่ยิ่งใหญ่ที่สุดในปีนี้', '2025-09-21'),
(13, 'red dead redemption 2', 1599.00, 2, '/uploads/1758544985428-873235173.jpg', 'เกมแนวคาวบอย', '2025-12-04'),
(14, 'Sifu', 539.00, 1, '/uploads/1758579945025-59655616.avif', 'Sifu เป็นเกมต่อสู้มุมมองบุคคลที่สามที่สมจริงซึ่งอัดแน่นไปด้วยกลไกการต่อสู้แบบกังฟู และศิลปะการต่อสู้ที่เคลื่อนไหวแบบแบบภาพยนตร์ ซึ่งจะนำคุณไปสู่เส้นทางแห่งการล้างแค้น', '2025-02-21'),
(16, 'Hogwarts Legacy', 1890.00, 2, '/uploads/1758580045196-993729099.avif', 'Hogwarts Legacy เป็นเกมแอ็กชันแนว RPG แบบโอเพนเวิลด์ที่ชวนดื่มด่ำ ตอนนี้คุณจะได้ควบคุมความเป็นไปต่างๆ และเป็นศูนย์กลางการผจญภัยของคุณเองในโลกแห่งจอมเวท', '2024-12-31'),
(17, 'The Witcher 3: Wild Hunt - Complete Edition', 1380.00, 1, '/uploads/1758580128617-908416656.avif', 'เกมที่ได้รับรางวัลมากที่สุดของยุค ตอนนี้ได้พัฒนาเพื่อยุคต่อไป สัมผัส The Witcher 3: Wild Hunt และภาคเสริมในคอลเลกชันที่สมบูรณ์ที่สุดนี้ มีการพัฒนางานภาพและประสิทธิภาพของเกม เนื้อหาเพิ่มเติมใหม่ๆ โหมดถ่ายรูป และอีกมากมาย!', '2023-12-21'),
(18, 'Marvel\'s Spider-Man 2', 1690.00, 1, '/uploads/1758585533878-459800237.avif', 'พลังที่เหลือเชื่อของซิมไบโอตทำให้ปีเตอร์ ปาร์กเกอร์ และไมลส์ โมราเลสต้องพยายามต่อสู้สุดกำลัง ในขณะเดียวกันก็ต้องรักษาสมดุลระหว่างการใช้ชีวิต มิตรภาพ และหน้าที่ของผู้ปกป้องในเกมสไปเดอร์แมนภาคต่อสุดเร้าใจที่ใคร ๆ ต่างก็ชื่นชมอย่างล้นหลาม', '2024-04-05'),
(19, 'Avatar: Frontiers of Pandora', 1999.00, 1, '/uploads/1758580649822-144831985.avif', 'ใน Avatar: Frontiers of Pandora™ คุณจะได้เริ่มต้นการเดินทางไปทั่วโลกกว้างแห่งพรมแดนตะวันตกที่ไม่เคยมีใครได้เห็นมาก่อน เชื่อมต่อกับมรดกที่สูญหายไปของคุณอีกครั้ง และค้นพบความหมายของการเป็นชาวนาวี เมื่อคุณได้เข้าร่วมกับกลุ่มอื่นๆ เพื่อปกป้องแพนดอร่าจากกองกำลังอาร์ดีเอที่น่าเกรงขาม', '2024-12-04'),
(20, 'Borderlands®4', 1790.00, 2, '/uploads/1758635412780-594234580.webp', 'Borderlands 4 คือเกมยิงแนวลูตเตอร์สุดระห่ำ อัดแน่นไปด้วยอาวุธนับพันล้าน ศัตรูสุดอันตราย และแอ็กชันสุดมันในโหมดเล่นร่วมกัน หลบหนีจากดาวเคราะห์อันตรายที่ซ่อนเร้น ในฐานะหนึ่งในสี่ Vault Hunter สุดแกร่งคนใหม่', '2025-09-23'),
(22, 'Dying Light: The Beast', 1799.00, 2, '/uploads/1758655445215-220426859.avif', 'Dying Light: The Beast เป็นการผจญภัยซอมบี้สุดระทึกที่เกิดขึ้นหลังหายนะในแคสเตอร์วูดส์ ซึ่งครั้งหนึ่งเคยเป็นจุดหมายยอดนิยมของนักท่องเที่ยว หลังจากผ่านการทดลองมาอย่างยาวนานถึง 13 ปี คุณหลบหนีและตามล่าผู้ที่จับกุมคุณเพื่อแก้แค้น แต่กลับพบว่ายังมีสิ่งที่ต้องเผชิญอีกมากมาย แม้ว่าจะไม่มีประชากรมากเหมือนเมื่อก่อน แต่ก็ยังมีผู้คนบางกลุ่มอยู่ที่นี่ รวมทั้งสิ่งที่น่ากลัวอีกมากมาย บางคนจะขอความช่วยเหลือ บางคนอาจต้องการฆ่าคุณ และนั่นยังไม่รวมถึงสิ่งมีชีวิตลึกลับที่เปลี่ยนป่าให้กลายเป็นพื้นที่ล่าสัตว์', '2025-09-23'),
(23, 'EA SPORTS™ Madden NFL 26', 1390.00, 5, '/uploads/1758655536581-981680355.webp', 'สร้างจากการแข่งขันจริง ข้อมูล NFL จริงที่ขับเคลื่อน Madden ที่สมจริงที่สุดในปัจจุบัน', '2025-09-23'),
(25, 'LEGO® Voyagers', 490.00, 4, '/uploads/1758655695134-197530894.avif', 'From the makers of LEGO® Builder\'s Journey comes a new 2-player co-op adventure about friendship and play. When two friends make it their mission to rescue an abandoned spaceship, they embark on a journey beyond their wildest dreams.', '2025-09-23'),
(26, 'F1® 25', 1690.00, 5, '/uploads/1758655865645-210865730.avif', 'จารึกสถิติของคุณไว้บนโลกของการแข่งรถใน F1® 25 ซึ่งเป็นวิดีโอเกมอย่างเป็นทางการของ 2025 FIA Formula One World Championship™', '2025-09-23'),
(29, 'inZOI', 1490.00, 1, '/uploads/1758656707613-754302853.jpg', 'นี่คือเกมจำลองชีวิตเกมแรกของเรา เราจึงต้องการสร้างผลิตภัณฑ์ที่ตอบโจทย์ความคาดหวังของผู้เล่นที่ชื่นชอบเกมประเภทนี้มาหลายปี เกมประเภทนี้มีให้เห็นไม่มากนักในวงการเกม เราจึงเชื่อว่าการเปิดตัว inZOI ในช่วง Early Access จะช่วยให้ผู้เล่นได้ทำความรู้จักกับเกมและให้ข้อเสนอแนะที่จะช่วยเราพัฒนาเกมต่อไป ความร่วมมือนี้ไม่เพียงแต่ช่วยให้เราพัฒนาเกมได้ดีขึ้นเท่านั้น แต่ยังช่วยให้เรามุ่งเน้นไปที่ฟีเจอร์ต่างๆ ที่จะดึงดูดใจชุมชนเกมของเราได้มากที่สุดอีกด้วย', '2025-09-23');

-- --------------------------------------------------------

--
-- Table structure for table `purchased_games`
--

CREATE TABLE `purchased_games` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  `purchased_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchased_games`
--

INSERT INTO `purchased_games` (`id`, `user_id`, `game_id`, `purchased_at`) VALUES
(48, 22, 9, '2025-09-23 14:49:53'),
(49, 22, 11, '2025-09-23 14:49:53'),
(50, 22, 10, '2025-09-23 15:34:42'),
(51, 22, 16, '2025-09-23 15:36:14'),
(52, 23, 8, '2025-09-23 15:41:40'),
(53, 23, 9, '2025-09-23 15:41:40'),
(54, 23, 18, '2025-09-23 16:03:00'),
(55, 23, 17, '2025-09-23 16:36:15'),
(56, 23, 16, '2025-09-23 17:15:25'),
(57, 23, 20, '2025-09-23 17:21:04'),
(58, 24, 7, '2025-09-23 18:09:19'),
(59, 24, 9, '2025-09-23 18:12:13'),
(60, 24, 11, '2025-09-23 18:12:13'),
(61, 24, 13, '2025-09-23 18:12:13'),
(62, 24, 19, '2025-09-23 18:12:13');

-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

CREATE TABLE `purchases` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `purchase_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `total_amount` decimal(12,2) NOT NULL,
  `discount_code_id` int(11) DEFAULT NULL,
  `final_amount` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchases`
--

INSERT INTO `purchases` (`id`, `user_id`, `purchase_date`, `total_amount`, `discount_code_id`, `final_amount`) VALUES
(32, 22, '2025-09-23 14:49:53', 622.99, NULL, 622.99),
(35, 23, '2025-09-23 15:41:40', 129.98, NULL, 129.98),
(38, 23, '2025-09-23 17:15:25', 1890.00, 13, 0.00),
(39, 23, '2025-09-23 17:21:04', 1790.00, 13, 0.00),
(40, 24, '2025-09-23 18:09:19', 1000.00, 13, 0.00),
(41, 24, '2025-09-23 18:12:13', 3220.99, NULL, 3220.99);

-- --------------------------------------------------------

--
-- Table structure for table `purchase_items`
--

CREATE TABLE `purchase_items` (
  `id` int(11) NOT NULL,
  `purchase_id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  `price_at_purchase` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_items`
--

INSERT INTO `purchase_items` (`id`, `purchase_id`, `game_id`, `price_at_purchase`) VALUES
(48, 32, 9, 79.99),
(49, 32, 11, 543.00),
(52, 35, 8, 49.99),
(53, 35, 9, 79.99),
(56, 38, 16, 1890.00),
(57, 39, 20, 1790.00),
(58, 40, 7, 1000.00),
(59, 41, 9, 79.99),
(60, 41, 11, 543.00),
(61, 41, 13, 599.00),
(62, 41, 19, 1999.00);

-- --------------------------------------------------------

--
-- Table structure for table `ranking`
--

CREATE TABLE `ranking` (
  `id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  `sales_count` int(11) NOT NULL DEFAULT 0,
  `rank_position` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ranking`
--

INSERT INTO `ranking` (`id`, `game_id`, `sales_count`, `rank_position`) VALUES
(25, 9, 3, NULL),
(26, 11, 2, NULL),
(27, 10, 1, NULL),
(28, 16, 2, NULL),
(29, 8, 1, NULL),
(31, 18, 1, NULL),
(32, 17, 1, NULL),
(34, 20, 1, NULL),
(35, 7, 1, NULL),
(38, 13, 1, NULL),
(39, 19, 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `role` enum('user','admin') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `wallet_balance` decimal(12,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `avatar_url`, `role`, `created_at`, `wallet_balance`) VALUES
(4, 'admin', 'admin@gmail.com', '$2b$10$NHYl7NDwG.4hPCdeBRKCteDRUrgMwGpcaYJ0vqVX3isUcUzJA1UEm', '/uploads/d1059a98-1a79-4bd6-bf1d-5cdd5e0b14c4.jpg', 'admin', '2025-09-20 18:43:05', 200.00),
(22, 'คนสวย', 'ww@gmail.com', '$2b$10$R.5BptD7fGgLU5hr6GPQ9eLJ1MzIq0qHeVWOtIdjOd.pkqd9vyi6m', '/uploads/ab9fcf32-a849-4d94-aafa-f06f33a63692.jpg', 'user', '2025-09-23 14:47:18', 377.01),
(23, 'June', 'j@gmail.com', '$2b$10$ivlYAXY2BFtSlTWbmuwRQez/BCesHcWsWy9H87oUzx30ALfhTdNw2', '/uploads/1758641935503qcifpjn8efi.jpg', 'user', '2025-09-23 15:38:55', 370.02),
(24, 'juay', 'juay@gmail.com', '$2b$10$4bEp94Qd9pufJ4o5O6yCNOqF0gHCLxTw3k/mtxfNx.SZ2g.ywPOTq', '/uploads/17586508473342az55wi3kro.jpg', 'user', '2025-09-23 18:07:27', 97479.01),
(25, 'mrt', 'mrt@gmail.com', '$2b$10$kfuNQV0OBcXI.w45DD9UXeeZS8SG2BkCdP0p9./8lOlNWaTWRq0dS', '/uploads/ab9fcf32-a849-4d94-aafa-f06f33a63692.jpg', 'user', '2025-09-23 20:23:03', 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `user_discount_codes`
--

CREATE TABLE `user_discount_codes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `discount_code_id` int(11) NOT NULL,
  `used_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_transactions`
--

CREATE TABLE `user_transactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` enum('deposit','purchase') NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_transactions`
--

INSERT INTO `user_transactions` (`id`, `user_id`, `type`, `amount`, `description`, `created_at`) VALUES
(73, 22, 'deposit', 500.00, 'Deposit wallet', '2025-09-23 14:48:50'),
(74, 22, 'deposit', 500.00, 'Deposit wallet', '2025-09-23 14:48:55'),
(75, 22, 'purchase', 622.99, 'Purchase games', '2025-09-23 14:49:53'),
(76, 22, 'purchase', 0.00, 'Purchase games', '2025-09-23 15:34:42'),
(77, 22, 'purchase', 0.00, 'Purchase games', '2025-09-23 15:36:14'),
(78, 23, 'deposit', 500.00, 'Deposit wallet', '2025-09-23 15:41:30'),
(79, 23, 'purchase', 129.98, 'Purchase games', '2025-09-23 15:41:40'),
(80, 23, 'purchase', 0.00, 'Purchase games', '2025-09-23 16:03:00'),
(81, 23, 'purchase', 0.00, 'Purchase games', '2025-09-23 16:36:15'),
(82, 23, 'purchase', 0.00, 'Purchase games', '2025-09-23 17:15:25'),
(83, 23, 'purchase', 0.00, 'Purchase games', '2025-09-23 17:21:04'),
(84, 24, 'purchase', 0.00, 'Purchase games', '2025-09-23 18:09:19'),
(85, 24, 'deposit', 200.00, 'Deposit wallet', '2025-09-23 18:10:30'),
(86, 24, 'deposit', 500.00, 'Deposit wallet', '2025-09-23 18:10:40'),
(87, 24, 'deposit', 100000.00, 'Deposit wallet', '2025-09-23 18:10:47'),
(88, 24, 'purchase', 3220.99, 'Purchase games', '2025-09-23 18:12:13');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cart_game` (`cart_id`,`game_id`),
  ADD KEY `cart_items_ibfk_2` (`game_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `discount_codes`
--
ALTER TABLE `discount_codes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `games`
--
ALTER TABLE `games`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `purchased_games`
--
ALTER TABLE `purchased_games`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`,`game_id`),
  ADD KEY `game_id` (`game_id`);

--
-- Indexes for table `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `discount_code_id` (`discount_code_id`);

--
-- Indexes for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_id` (`purchase_id`),
  ADD KEY `game_id` (`game_id`);

--
-- Indexes for table `ranking`
--
ALTER TABLE `ranking`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `game_id` (`game_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_discount_codes`
--
ALTER TABLE `user_discount_codes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_code` (`user_id`,`discount_code_id`),
  ADD KEY `fk_discount` (`discount_code_id`);

--
-- Indexes for table `user_transactions`
--
ALTER TABLE `user_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `discount_codes`
--
ALTER TABLE `discount_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `games`
--
ALTER TABLE `games`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `purchased_games`
--
ALTER TABLE `purchased_games`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT for table `purchases`
--
ALTER TABLE `purchases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `purchase_items`
--
ALTER TABLE `purchase_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT for table `ranking`
--
ALTER TABLE `ranking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `user_discount_codes`
--
ALTER TABLE `user_discount_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `user_transactions`
--
ALTER TABLE `user_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`);

--
-- Constraints for table `games`
--
ALTER TABLE `games`
  ADD CONSTRAINT `games_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Constraints for table `purchased_games`
--
ALTER TABLE `purchased_games`
  ADD CONSTRAINT `purchased_games_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `purchased_games_ibfk_2` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`);

--
-- Constraints for table `purchases`
--
ALTER TABLE `purchases`
  ADD CONSTRAINT `purchases_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `purchases_ibfk_2` FOREIGN KEY (`discount_code_id`) REFERENCES `discount_codes` (`id`);

--
-- Constraints for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD CONSTRAINT `purchase_items_ibfk_1` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `purchase_items_ibfk_2` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`);

--
-- Constraints for table `ranking`
--
ALTER TABLE `ranking`
  ADD CONSTRAINT `ranking_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`);

--
-- Constraints for table `user_discount_codes`
--
ALTER TABLE `user_discount_codes`
  ADD CONSTRAINT `fk_discount` FOREIGN KEY (`discount_code_id`) REFERENCES `discount_codes` (`id`),
  ADD CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `user_transactions`
--
ALTER TABLE `user_transactions`
  ADD CONSTRAINT `user_transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
