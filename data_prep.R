library(tidyverse)
library(dplyr)
library(jsonlite)
library(sf)

# cleaning and joining data for the map
waterfall <- read.csv("data/rent_stab_waterfall_10_15.csv") %>%
  select(-c(X)) %>%
  mutate(rs_change_19_24 = rs2024 - rs2019) %>%
  select(bbl, cd, rent_stab_pct, rs2024, rs_change_19_24, unitsres, latitude, longitude)

rent_stab_external <- read.csv("data/external_rent_stab.csv") %>%
  select(-c(X)) %>%
  left_join(waterfall, by="bbl") %>%
  st_as_sf(coords = c("longitude", "latitude")) %>%
  st_write("data/rent_stab2.geojson")
  
rent_stab_json <- toJSON(rent_stab_external, dataframe='rows', pretty= TRUE)

write(rent_stab_json, "data/rent_stab.json")
