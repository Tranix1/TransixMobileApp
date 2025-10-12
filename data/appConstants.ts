
export const truckType = [
    { id: 0, name: "Rigid" },
    { id: 1, name: "Triaxle" },
    { id: 2, name: "Super Link" },
]
export const cargoArea = [
    { id: 0, name: 'Flat deck', description: 'Ideal for transporting oversized or heavy loads.', image: require('@/assets/images/Trucks/images (2).jpeg') },
    { id: 1, name: 'Bulk Trailer', description: 'Used for carrying bulk materials like grains or minerals.', image: require('@/assets/images/Trucks/download (1).jpeg') },
    { id: 2, name: 'Dropside', description: 'Truck with removable sides, perfect for transporting heavy and oversized goods.', image: require('@/assets/images/Trucks/8-ton-drop-side-truck.jpg') },
    { id: 3, name: 'Side Tipper', description: 'Suitable for unloading materials like sand or gravel.', image: require('@/assets/images/Trucks/images (5).jpeg') },
    { id: 4, name: 'Tautliner', description: 'Versatile truck with curtains for easy loading and unloading.', image: require('@/assets/images/Trucks/download (3).jpeg') },

    { id: 5, name: 'Box', description: 'Enclosed truck ideal for transporting packaged goods, furniture, and electronics.', image: require('@/assets/images/Trucks/download (8).jpeg') },

    { id: 6, name: 'Low Bed', description: 'Designed for transporting heavy machinery and equipment.', image: require('@/assets/images/Trucks/H805f1f51529345648d1da9e5fcd6807e2.jpg') },

    { id: 7, name: 'Refrigerated', description: 'Temperature-controlled truck used for transporting perishable goods like food and medicine.', image: require('@/assets/images/Trucks/download (7).jpeg') },

    { id: 8, name: 'Tanker', description: 'Used for transporting liquids like fuel or chemicals.', image: require('@/assets/images/Trucks/images (7).jpeg') },

    { id: 9, name: 'Other', description: 'Custom or specialized truck types designed for unique transport needs.', image: require('@/assets/images/Trucks/download (4).jpeg') },
]
export const tankerTypes = [
    {
        id: 0,
        name: "Oil Tankers",
        description: "Carry oil or its products.",
        products: ["Crude oil", "Gasoline", "Diesel", "Jet fuel"]
    },
    {
        id: 1,
        name: "Chemical Tankers",
        description: "Transport various liquid chemicals in bulk.",
        products: ["Acids", "Vegetable oils", "Ethylene glycol", "Methanol"]
    },
    {
        id: 2,
        name: "Gas Carriers",
        description: "Transport liquefied gases at very low temperatures or under high pressure.",
        products: ["Liquefied Natural Gas (LNG)", "Liquefied Petroleum Gas (LPG)", "Propane", "Butane"]
    },
    {
        id: 3,
        name: "Food-Grade Tankers",
        description: "Transporting liquid food products.",
        products: ["Milk", "Juice", "Wine", "Edible oils"]
    },
    {
        id: 4,
        name: "Specialized Cargo ",
        description: "Tankers built for specific, unique liquid cargoes.",
        products: ["Bitumen", "Slurry", "Molten sulfur", "Hydrogen"]
    },
    {
        id: 5,
        name: "Other",
        description: "Tankers built for specific, unique liquid cargoes.",
        products: ["Bitumen", "Slurry", "Molten sulfur", "Hydrogen"]
    }
];

export const trailerConfigurations = [
    { id: 0, name: "single Axle" },
    { id: 1, name: "tandem" },
    { id: 2, name: "triaxle" },
    { id: 3, name: "MultiAxle" },
    { id: 4, name: 'Other' }
]
export const truckSuspensions = [

    { id: 1, name: "Link" },
    { id: 3, name: "Air suspension" },
    { id: 4, name: "mechanical steel" },
    { id: 5, name: "Other" },
]


export const litresCapacity = [
    { id: 0, name: '300L' },
    { id: 1, name: '400L' },
    { id: 2, name: '500L' },
    { id: 3, name: '700L' },
    { id: 4, name: '800L' },
    { id: 5, name: '900L' },
]

export const tonneSizes = [
    { id: 0, name: '1-3 T' },
    { id: 1, name: '3-6 T' },
    { id: 2, name: '7-10 T' },
    { id: 3, name: '11-13 T' },
    { id: 4, name: '12-15 T' },
    { id: 5, name: '16-20 T' },
    { id: 5, name: '30T' },
    { id: 7, name: '34T' },
];


export const countryCodes = [
    { id: 0, name: '+263' },
    { id: 1, name: '+27' },
    { id: 2, name: '+264' },
    { id: 3, name: '+255' },
    { id: 4, name: '+258' },
    { id: 5, name: '+260' },
    { id: 6, name: '+265' },
    { id: 7, name: '+267' },
    { id: 8, name: '+243' }
]



// Store Data 
// Product categories
export const productCategories = [
    { id: 0, name: "Vehicle" },
    { id: 1, name: "Trailers" },
    { id: 2, name: "Container" },
    { id: 3, name: "Spares" },
    { id: 4, name: "Service Provider" },
];

// Vehicle types
export const smallVehicleTypes = [
    { id: 1, name: "Sedan" },
    { id: 3, name: "SUV" },
    { id: 4, name: "Vans" },
    { id: 5, name: "Pickup Trucks" },
    { id: 6, name: "Hatchbeacks" },
    { id: 7, name: "Convetibles" },
    { id: 8, name: "Crissovers" },
    { id: 9, name: "(Other) Small Veh. Type" }
];


export const heavyEupementType = [

    { id: 1, name: "Tipper" },
    { id: 2, name: "Excavator" },
    { id: 3, name: "Bulldozer" },
    { id: 4, name: "Compactors" },
    { id: 5, name: "Graders" },
    { id: 6, name: "ConcreteMixer" },
    { id: 7, name: "TrackedLoader" },
    { id: 8, name: "Pavers" },
    { id: 9, name: "(Other) Heavy Equip. Type" },
]
export const cargoVehiType = [

    { id: 2, name: "BoxTrucks" },
    { id: 3, name: "FlatbedTrucks" },
    { id: 4, name: "RefrigeratedTrucks" },
    { id: 5, name: "TankerTrucks" },
    { id: 6, name: "CurtainsideTrucks" },
    { id: 7, name: "otherCargos" },
    { id: 8, name: "(Other) Cargo Veh. Type" },
]


export const smallVehicleMake = [
    { id: 1, name: "Toyota" },
    { id: 2, name: "MercedesBenz" },
    { id: 3, name: "BMW" },
    { id: 4, name: "Honda" },
    { id: 5, name: "NISSAN" },
    { id: 6, name: "MAZDA" },
    { id: 7, name: "Volkswagen" },
    { id: 8, name: "Ford" },
    { id: 9, name: "Isuzu" },
    { id: 10, name: "Chevrolet" },
    { id: 11, name: "Hyundai" },
    { id: 12, name: "Renault" },
    { id: 13, name: "Mitsubishi" },
    { id: 14, name: "Kia" },
    { id: 15, name: "(Other) Small Veh. Make" },
]
export const cargoTruckMake = [

    { id: 1, name: "cargoMercedesBenz" },
    { id: 2, name: "cargoMAN" },
    { id: 3, name: "cargoScania" },
    { id: 4, name: "cargoHowo" },
    { id: 5, name: "cargoVolvo" },
    { id: 6, name: "cargoDAF" },
    { id: 7, name: "cargoIveco" },
    { id: 8, name: "cargoUD" },
    { id: 9, name: "cargoIsuzu" },
    { id: 10, name: "cargoMitsubishiFuso" },
    { id: 11, name: "cargoHino" },
    { id: 12, name: "(Other) Cargo Veh. Make" },
]
export const heavyEupementMake = [

    { id: 1, name: "heavyCaterpillar" },
    { id: 2, name: "heavyVolvo" },
    { id: 3, name: "heavyJohnDeere" },
    { id: 4, name: "heavyHyundai" },
    { id: 5, name: "heavySany" },
    { id: 6, name: "heavyKobelco" },
    { id: 7, name: "heavyXCMG" },
    { id: 8, name: "heavyBobcat" },
    { id: 9, name: "heavyHitachi" },
    { id: 10, name: "heavyManitou" },
    { id: 11, name: "heavyKubota" },
    { id: 12, name: "heavyOtherM" },
    { id: 13, name: "(Other) Heavy Equip. Make" },
]




// Types of service providers
export const serviceProivderType = [

    { id: 1, name: "AutoMechanic" },
    { id: 2, name: "HeavyDutyMechanic" },
    { id: 3, name: "MotoMechanic" },
    { id: 4, name: "AutoTechnician" },
    { id: 5, name: "MotoTechnician" },
    { id: 6, name: "HeavyEquipmentTechnician" },
    { id: 7, name: "Warehouse" },
    { id: 8, name: "(Other) S Provider. Type" },
]

// Transaction types
export const transactionTypes = [
    { id: 1, name: "Sell" },
    { id: 2, name: "Rent" },
    { id: 3, name: "Rent to Buy" },
    { id: 4, name: "Hire" },
    { id: 5, name: "Swap" },
];


// Types of Cntainer 
export const containerType = [
    { id: 1, name: "20 ft" },
    { id: 2, name: "40 ft" },
    { id: 9, name: "(Other) Container. Type" },
]


// Types of Cntainer 
export const containerMake = [
    { id: 1, name: "Loco" },
    { id: 2, name: "Soto" },
    { id: 9, name: "(Other) Container. Make" },
]



export const trailerType = [
    { id: 1, name: "Bulk trailer " },
    { id: 2, name: "SideTipper" },
    { id: 3, name: "Tautliner" },
    { id: 4, name: "Flatbed" },
    { id: 5, name: "Tanker" },
    { id: 6, name: "Refrigerated" },
    { id: 7, name: "CarHauler" },
    { id: 8, name: "Lowboy" },
    { id: 9, name: "(Other) Trailer. Type" },
]

export const trailerMake = [

    { id: 1, name: "Henred" },
    { id: 2, name: "(Other) Trailer. Make" },
]




export const sparesType = [

    { id: 1, name: "Engine Parts	Engine block, pistons, gaskets, etc." },
    { id: 2, name: "Suspension & Steering	Shocks, arms, tie rods" },
    { id: 3, name: "Brakes	Pads, discs, drums" },
    { id: 4, name: "Electrical	Battery, alternator, starter" },
    { id: 5, name: "Cooling System	Radiator, fan, thermostat" },
    { id: 6, name: "Transmission	Clutch, gearbox, mounts" },
    { id: 7, name: "Body Parts	Bumper, mirrors, lights" },
    { id: 8, name: "Filters	Oil, air, fuel filters" },
    { id: 9, name: "Tyres & Wheels	Rims, tyres, tubes" },
    { id: 10, name: "Unterior	Seats, dashboard, controls" },
    { id: 11, name: "Accessories	Mats, covers, bulbs " },
]

export const Countries = [
    { id: 1, name: "Zimbabwe" },
    { id: 2, name: "South Africa" },
    { id: 3, name: "Namibia" },
    { id: 4, name: "DRC" },
    { id: 4, name: "Tanzania" },
    { id: 5, name: "Mozambique" },
    { id: 6, name: "Zambia" },
    { id: 7, name: "Botswana" },
    { id: 8, name: "Malawi" },
    { id: 9, name: "Angola" },
    { id: 10, name: "Botswana" },
    { id: 11, name: "Other" },
];

