DROP TABLE IF EXISTS `boxes`;
CREATE TABLE `boxes` (
`id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
`adresse` VARCHAR(100) NOT NULL,
`CP` VARCHAR(10) NOT NULL,
`lat` VARCHAR(20) NULL,
`long` VARCHAR(20) NULL,
`ville` VARCHAR(40) NULL,
`quantity` INT NOT NULL
);

INSERT INTO boxes (`adresse`, `CP`, `lat`, `long`, `ville`, `quantity`)
VALUES
("9 Rue Constantine", "69001", "45.7670693", "4.8320279", "Lyon 1", "5"),
("Place Sathonay", "69001", "45.7691363", "4.8301485", "Lyon 1", "7"),
("3 Quai Jean Moulin", "69001", "45.7674337", "4.8377007", "Lyon 1", "0"),
("14 Quai Saint Vincent", "69001", "45.7679787", "4.8195187", "Lyon 1", "2"),
("87 Rue de la République", "69002", "45.7581745", "4.8346659", "Lyon 2", "8"),
("1 Place de l'Hôpital", "69002", "45.7593263", "4.8358695", "Lyon 2", "4"),
("87 Rue de la République", "69002", "45.7581745", "4.8346659", "Lyon 2", "12"),
("Rue Jean Fabre", "69002", "45.7602682", "4.8330347", "Lyon 2", "3"),
("245 Rue Garibaldi", "69003", "45.7541448", "4.8535559", "Lyon 3", "3"),
("Place Guichard", "69003", "45.7590482", "4.8473042", "Lyon 3", "2"),
("7 Rue Auguste Lacroix", "69003", "45.7554089", "4.8450388", "Lyon 3", "3"),
("53 Rue Charles Richard", "69003", "45.7495455", "4.888851", "Lyon 3", "1"),
("30 Boulevard Vivier-Merle", "69003", "45.7606813", "4.8575503", "Lyon 3", "4"),
("249 rue Vendome", "69003", "45.7558726", "4.8478133", "Lyon 3", "0"),
("3 Place d Arsonval", "69003", "45.7433371", "4.8794001", "Lyon 3", "2"),
("7 Place de la Ferrandière", "69003", "45.7597289", "4.8709135", "Lyon 3", "0"),
("17 Rue Dr Bouchut", "69003", "45.7621058", "4.8557052", "Lyon 3", "1"),
("3 Place Sainte Anne", "69003", "45.7574606", "4.865301", "Lyon 3", "3"),
("11 Rue Richan", "69004", "45.7802928", "4.836122", "Lyon 4", "3"),
("35 Quai Joseph Gillet", "69004", "45.776331", "4.8109559", "Lyon 4", "2"),
("10 Rue de Vauzelless", "69001", "45.7729907", "4.8265258", "Lyon 1", "2"),
("2 Place Benedict Tessier", "69005", "45.7558487", "4.7975989", "Lyon 5", "1"),
("44 Place Saint Irénée", "69005", "45.7548904", "4.8124515", "Lyon 5", "2"),
("163 Avenue Barthélémy Buyer", "69005", "45.7629918", "4.7960166", "Lyon 5", "3");