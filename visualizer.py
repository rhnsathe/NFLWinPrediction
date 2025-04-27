import pandas as pd
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pd.options.display.max_rows = 9999
df = pd.read_csv("games.csv")
year_set = set(df['season'])
turf_type = set(df['surface'])
print("THIS IS TURF", turf_type)
year_list = list(year_set)

def checkAGTSYearByYear(year_set):
    ags_arr = [[] for _ in year_set]
    ags_arr2 = [0 for _ in year_set]
    for i, year in enumerate(year_set):
        year_df = df[df['season'] == year]
        filtered_rows = year_df.loc[
            (
                (year_df['spread_line'].astype(int) < 0) &
                (year_df['result'].astype(int) > year_df['spread_line'].astype(int))
            ) | (
                (year_df['spread_line'].astype(int) > 0) &
                (year_df['result'].astype(int) < year_df['spread_line'].astype(int))
            )
        ]
        print(year, len(filtered_rows))
        # Replace np.nan with None so that JSON conversion works
        filtered_rows = filtered_rows.replace({np.nan: None})
        ags_arr[i] = filtered_rows.to_dict(orient="records")
        ags_arr2[i] = [year, len(filtered_rows)]
    return ags_arr2

# Create an API endpoint that calls the function
@app.get("/ags_arr")
async def get_ags_arr():
    #ags_arr = [1,2,3,4,5]
    ags_arr = checkAGTSYearByYear(year_set)
    return {"ags_arr": ags_arr}

@app.get("/ags_table_year")
async def get_ags_table_year(year_set: str):
    year = year_list[int(year_set) - 1999]
    print("We are fetched")
    year_df = df[df['season'] == year]
    filtered_rows = year_df.loc[
        (
            (year_df['spread_line'].astype(int) < 0) &
            (year_df['result'].astype(int) > year_df['spread_line'].astype(int))
        ) | (
            (year_df['spread_line'].astype(int) > 0) &
            (year_df['result'].astype(int) < year_df['spread_line'].astype(int))
        )
    ].copy()

    filtered_rows['result_spread_diff'] = (filtered_rows['result'].astype(float) - filtered_rows['spread_line'].astype(float))
    filtered_rows = filtered_rows.replace({np.nan: None})


    ags_table_year = filtered_rows.to_dict(orient="records")

    return {"ags_table_year": ags_table_year}




    
    
