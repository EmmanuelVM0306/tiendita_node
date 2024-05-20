CREATE DATABASE IF NOT EXISTS `pokimons`/*!40100 DEFAULT CHARACTER SET latin1 */;
USE `pokimons` ;


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;



drop table if exists `pokemon`;
drop table if exists `region`;



/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
create table if not exists `pokemon`(
  `id` int(11) auto_increment not null ,
  `nombre` varchar (11) NOT NULL ,   
  `mote` varchar(10) NOT NULL,
  `tipoP` varchar (11) NOT NULL ,   
  `tipoS` varchar(45) NOT NULL,
  `peso` double  NOT NULL,   
  `altura` double NOT NULL,
  `num_pokedex_nacional` int (3) NOT NULL ,   
  `genero` varchar(11) NOT NULL,
  `id_region` int(1) NOT NULL,
  `region` varchar(11) NOT NULL,
  `num_pokedex_regional` int(3) NOT NULL,
  primary key (`id`)
  /*,
  CONSTRAINT `id_regionmm` FOREIGN KEY (`id_region`) REFERENCES `region` (`id_region`) ON DELETE NO ACTION ON UPDATE NO ACTION
  */
)ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*create table if not exists `region`(
  `id_region` int(1) NOT NULL,
  `region` varchar(11) NOT NULL,
  `num_pokedex_regional` int(3) NOT NULL,
  primary key (`id_region`)
)ENGINE=InnoDB DEFAULT CHARSET=latin1;*/

