import * as CrystalTier from "./CrystalTier"
import * as ElementName from "./ElementName"
import * as PendingGuessStatus from "./PendingGuessStatus"
import * as StakingType from "./StakingType"
import * as Tier from "./Tier"

export { StakingRate } from "./StakingRate"
export type { StakingRateFields, StakingRateJSON } from "./StakingRate"
export { CrystalTier }

export type CrystalTierKind =
  | CrystalTier.Tier1
  | CrystalTier.Tier2
  | CrystalTier.Tier3
  | CrystalTier.Tier4
  | CrystalTier.Tier5
  | CrystalTier.Tier6
  | CrystalTier.Tier7
  | CrystalTier.Tier8
  | CrystalTier.Tier9
  | CrystalTier.Tier10
  | CrystalTier.Tier11
  | CrystalTier.Tier12
export type CrystalTierJSON =
  | CrystalTier.Tier1JSON
  | CrystalTier.Tier2JSON
  | CrystalTier.Tier3JSON
  | CrystalTier.Tier4JSON
  | CrystalTier.Tier5JSON
  | CrystalTier.Tier6JSON
  | CrystalTier.Tier7JSON
  | CrystalTier.Tier8JSON
  | CrystalTier.Tier9JSON
  | CrystalTier.Tier10JSON
  | CrystalTier.Tier11JSON
  | CrystalTier.Tier12JSON

export { ElementName }

export type ElementNameKind =
  | ElementName.Air
  | ElementName.Fire
  | ElementName.Earth
  | ElementName.Water
  | ElementName.Heat
  | ElementName.Steam
  | ElementName.Mud
  | ElementName.Pressure
  | ElementName.Rain
  | ElementName.Wind
  | ElementName.Lava
  | ElementName.Life
  | ElementName.Smoke
  | ElementName.Dust
  | ElementName.Fog
  | ElementName.Energy
  | ElementName.Seed
  | ElementName.Metal
  | ElementName.Ocean
  | ElementName.Glass
  | ElementName.Clay
  | ElementName.Cloud
  | ElementName.Stone
  | ElementName.Sun
  | ElementName.Time
  | ElementName.Oil
  | ElementName.Wave
  | ElementName.Ash
  | ElementName.Swamp
  | ElementName.River
  | ElementName.Worm
  | ElementName.Tornado
  | ElementName.Sand
  | ElementName.Mountain
  | ElementName.Snow
  | ElementName.Frost
  | ElementName.Magnet
  | ElementName.Fossil
  | ElementName.HotSprings
  | ElementName.Pond
  | ElementName.Coal
  | ElementName.Telescope
  | ElementName.Volcano
  | ElementName.Plastic
  | ElementName.Gasoline
  | ElementName.Bottle
  | ElementName.Sky
  | ElementName.Storm
  | ElementName.Plant
  | ElementName.Nail
  | ElementName.Sound
  | ElementName.Paint
  | ElementName.Alcohol
  | ElementName.Desert
  | ElementName.SolarPanel
  | ElementName.Windmill
  | ElementName.Furnace
  | ElementName.Dam
  | ElementName.FireExtinguisher
  | ElementName.Squid
  | ElementName.Tree
  | ElementName.Coral
  | ElementName.Gas
  | ElementName.Meteor
  | ElementName.Electricity
  | ElementName.Wire
  | ElementName.Bean
  | ElementName.Sugar
  | ElementName.Explosion
  | ElementName.Music
  | ElementName.Cloth
  | ElementName.Umbrella
  | ElementName.Balloon
  | ElementName.Island
  | ElementName.Cactus
  | ElementName.Ice
  | ElementName.Blizzard
  | ElementName.Ink
  | ElementName.Paper
  | ElementName.Apple
  | ElementName.Wood
  | ElementName.Antenna
  | ElementName.Dolphin
  | ElementName.Beach
  | ElementName.Fireworks
  | ElementName.Lightning
  | ElementName.Hail
  | ElementName.Art
  | ElementName.Coffee
  | ElementName.Tequila
  | ElementName.Rod
  | ElementName.Blueprint
  | ElementName.Hammer
  | ElementName.Fish
  | ElementName.Coin
  | ElementName.IceStorm
  | ElementName.TShirt
  | ElementName.Yacht
  | ElementName.Party
  | ElementName.Whale
export type ElementNameJSON =
  | ElementName.AirJSON
  | ElementName.FireJSON
  | ElementName.EarthJSON
  | ElementName.WaterJSON
  | ElementName.HeatJSON
  | ElementName.SteamJSON
  | ElementName.MudJSON
  | ElementName.PressureJSON
  | ElementName.RainJSON
  | ElementName.WindJSON
  | ElementName.LavaJSON
  | ElementName.LifeJSON
  | ElementName.SmokeJSON
  | ElementName.DustJSON
  | ElementName.FogJSON
  | ElementName.EnergyJSON
  | ElementName.SeedJSON
  | ElementName.MetalJSON
  | ElementName.OceanJSON
  | ElementName.GlassJSON
  | ElementName.ClayJSON
  | ElementName.CloudJSON
  | ElementName.StoneJSON
  | ElementName.SunJSON
  | ElementName.TimeJSON
  | ElementName.OilJSON
  | ElementName.WaveJSON
  | ElementName.AshJSON
  | ElementName.SwampJSON
  | ElementName.RiverJSON
  | ElementName.WormJSON
  | ElementName.TornadoJSON
  | ElementName.SandJSON
  | ElementName.MountainJSON
  | ElementName.SnowJSON
  | ElementName.FrostJSON
  | ElementName.MagnetJSON
  | ElementName.FossilJSON
  | ElementName.HotSpringsJSON
  | ElementName.PondJSON
  | ElementName.CoalJSON
  | ElementName.TelescopeJSON
  | ElementName.VolcanoJSON
  | ElementName.PlasticJSON
  | ElementName.GasolineJSON
  | ElementName.BottleJSON
  | ElementName.SkyJSON
  | ElementName.StormJSON
  | ElementName.PlantJSON
  | ElementName.NailJSON
  | ElementName.SoundJSON
  | ElementName.PaintJSON
  | ElementName.AlcoholJSON
  | ElementName.DesertJSON
  | ElementName.SolarPanelJSON
  | ElementName.WindmillJSON
  | ElementName.FurnaceJSON
  | ElementName.DamJSON
  | ElementName.FireExtinguisherJSON
  | ElementName.SquidJSON
  | ElementName.TreeJSON
  | ElementName.CoralJSON
  | ElementName.GasJSON
  | ElementName.MeteorJSON
  | ElementName.ElectricityJSON
  | ElementName.WireJSON
  | ElementName.BeanJSON
  | ElementName.SugarJSON
  | ElementName.ExplosionJSON
  | ElementName.MusicJSON
  | ElementName.ClothJSON
  | ElementName.UmbrellaJSON
  | ElementName.BalloonJSON
  | ElementName.IslandJSON
  | ElementName.CactusJSON
  | ElementName.IceJSON
  | ElementName.BlizzardJSON
  | ElementName.InkJSON
  | ElementName.PaperJSON
  | ElementName.AppleJSON
  | ElementName.WoodJSON
  | ElementName.AntennaJSON
  | ElementName.DolphinJSON
  | ElementName.BeachJSON
  | ElementName.FireworksJSON
  | ElementName.LightningJSON
  | ElementName.HailJSON
  | ElementName.ArtJSON
  | ElementName.CoffeeJSON
  | ElementName.TequilaJSON
  | ElementName.RodJSON
  | ElementName.BlueprintJSON
  | ElementName.HammerJSON
  | ElementName.FishJSON
  | ElementName.CoinJSON
  | ElementName.IceStormJSON
  | ElementName.TShirtJSON
  | ElementName.YachtJSON
  | ElementName.PartyJSON
  | ElementName.WhaleJSON

export { PendingGuessStatus }

export type PendingGuessStatusKind =
  | PendingGuessStatus.NotClaimed
  | PendingGuessStatus.Inventor
  | PendingGuessStatus.Reward
  | PendingGuessStatus.Normal
export type PendingGuessStatusJSON =
  | PendingGuessStatus.NotClaimedJSON
  | PendingGuessStatus.InventorJSON
  | PendingGuessStatus.RewardJSON
  | PendingGuessStatus.NormalJSON

export { StakingType }

export type StakingTypeKind = StakingType.Collection | StakingType.MerkleNode
export type StakingTypeJSON =
  | StakingType.CollectionJSON
  | StakingType.MerkleNodeJSON

export { Tier }

export type TierKind =
  | Tier.Tier0
  | Tier.Tier1
  | Tier.Tier2
  | Tier.Tier3
  | Tier.Tier4
  | Tier.Tier5
  | Tier.Tier6
  | Tier.Tier7
export type TierJSON =
  | Tier.Tier0JSON
  | Tier.Tier1JSON
  | Tier.Tier2JSON
  | Tier.Tier3JSON
  | Tier.Tier4JSON
  | Tier.Tier5JSON
  | Tier.Tier6JSON
  | Tier.Tier7JSON
