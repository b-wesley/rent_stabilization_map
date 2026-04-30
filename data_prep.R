library(tidyverse)
library(dplyr)
library(jsonlite)
library(sf)

# cleaning and joining data for the map
waterfall <- read.csv("data/rent_stab_waterfall_10_15.csv") %>%
  select(-c(X)) %>%
  mutate(rs_change_19_24 = rs2024 - rs2019) %>%
  select(bbl, cd, rent_stab_pct, rs2024, rs_change_19_24, unitsres, latitude, longitude)

boro_codes <- list(MN=1, BX=2, BK=3, QN=4, SI=5)
code_cd <- function(cd_name) {
  boro <- substr(cd_name, 1, 2)
  district <- substr(cd_name, 3, 4)

  boro_code <- boro_codes[boro]
  return(as.numeric(paste0(boro_code, district)))
}

cdtas <- read.csv('data/cdta_names.csv') %>%
  select(CDTA2020, CDTAName) %>%
  mutate(cd = code_cd(CDTA2020)) %>%
  select(cd, CDTAName)

pluto <- read.csv('data/nyc_pluto_25v4_csv/pluto_25v4.csv') %>%
  select(borough, bbl, address, unitsres)

rent_stab_external <- read.csv("data/external_rent_stab.csv") %>%
  select(-c(X)) %>%
  mutate(rs_bucket = case_when( 
          legacy_properties_all_rs == 1 ~ "Legacy (Pre-1974)",
          programmatic_properties == 1 ~ "Programatic Rent Stabilization",
          govt_subsidized_income_restricted_rs == 1 ~ "Government-Subsidized",
          mixed_income_rs == 1 ~ "Mixed Income Rent-Stabilized",
          .default = "Other Rent Stabilization"
         )) %>%
  left_join(waterfall, by="bbl") %>%
  left_join(cdtas, by="cd")%>%
  filter(rs_change_19_24 != 0 & !is.na(rs_change_19_24)) %>%
  st_as_sf(coords = c("longitude", "latitude")) %>%
  st_write("data/rent_stab2.geojson")
  
rent_stab_json <- toJSON(rent_stab_external, dataframe='rows', pretty= TRUE)

write(rent_stab_json, "data/rent_stab_0427.json")
