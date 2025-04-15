'use client'

import { useSearchParams } from "next/navigation";
import {useEffect, useState} from 'react';
import Image from "next/image";

interface TableRow {
  game_id: string;
  season: string;
  game_type: string;
  week: string;
  gameday: string;
  weekday: string;
  gametime: string;
  away_team: string;
  away_score: string;
  home_team: string;
  home_score: string;
  spread_line: string;
  result_spread_diff: number;
}

const teamLogos: Record<string, string> = {
  ARI: "/nfl-logos/ARI.png", // Arizona Cardinals
  ATL: "/nfl-logos/ATL.png", // Atlanta Falcons
  BAL: "/nfl-logos/BAL.png", // Baltimore Ravens
  BUF: "/nfl-logos/BUF.png", // Buffalo Bills
  CAR: "/nfl-logos/CAR.png", // Carolina Panthers
  CHI: "/nfl-logos/CHI.png", // Chicago Bears
  CIN: "/nfl-logos/CIN.png", // Cincinnati Bengals
  CLE: "/nfl-logos/CLE.png", // Cleveland Browns
  DAL: "/nfl-logos/DAL.png", // Dallas Cowboys
  DEN: "/nfl-logos/DEN.png", // Denver Broncos
  DET: "/nfl-logos/DET.png", // Detroit Lions
  GB:  "/nfl-logos/GB.png",  // Green Bay Packers
  HOU: "/nfl-logos/HOU.png", // Houston Texans
  IND: "/nfl-logos/IND.png", // Indianapolis Colts
  JAX: "/nfl-logos/JAX.png", // Jacksonville Jaguars
  KC:  "/nfl-logos/KC.png",  // Kansas City Chiefs
  LAC: "/nfl-logos/LAC.png", // Los Angeles Chargers
  LAR: "/nfl-logos/LAR.png", // Los Angeles Rams
  LV:  "/nfl-logos/LV.png",  // Las Vegas Raiders
  MIA: "/nfl-logos/MIA.png", // Miami Dolphins
  MIN: "/nfl-logos/MIN.png", // Minnesota Vikings
  NE:  "/nfl-logos/NE.png",  // New England Patriots
  NO:  "/nfl-logos/NO.png",  // New Orleans Saints
  NYG: "/nfl-logos/NYG.png", // New York Giants
  NYJ: "/nfl-logos/NYJ.png", // New York Jets
  OAK: "/nfl-logos/OAK.png", // Oakland Raiders (Deprecated)
  PHI: "/nfl-logos/PHI.png", // Philadelphia Eagles
  PIT: "/nfl-logos/PIT.png", // Pittsburgh Steelers
  SD: "/nfl-logos/SD.png", // San Diego Chargers (Deprecated)
  SF:  "/nfl-logos/SF.png",  // San Francisco 49ers
  SEA: "/nfl-logos/SEA.png", // Seattle Seahawks
  STL: "/nfl-logos/STL.png", // St. Louis Rams (Deprecated)
  TB:  "/nfl-logos/TB.png",  // Tampa Bay Buccaneers
  TEN: "/nfl-logos/TEN.png", // Tennessee Titans
  WAS: "/nfl-logos/WAS.png" // Washington
};

export default function DetailsPage() {
    const searchParams = useSearchParams();
    const point = searchParams.get('point');
    const [data, setData] = useState(null);
    const [agsTable, setAgsTable] = useState<TableRow[]>([]);
    const [originalAgsTable, setOriginalAgsTable] = useState<TableRow[]>([]);
    const [sorted, setSorted] = useState(false);
    
    useEffect(() => {
        if (point) {
          // Fetch data from your FastAPI endpoint using the point value
          fetch(`http://localhost:8000/ags_table_year?year_set=${encodeURIComponent(point)}`)
            .then((res) => res.json())
            .then((result) => {
                const agsTable = result.ags_table_year
                console.log('Local ags:   ', agsTable)
                setData(result);
                setAgsTable(agsTable);
                setOriginalAgsTable(agsTable);
              }
            )
            .catch((err) => console.error('Error fetching data:', err));
        }
      }, [point]);

    
    const toggleSort = () => {
      if (sorted) {
        setAgsTable(originalAgsTable);
      } else {
        const sortedData = [...agsTable].sort(
          (a, b) => Math.abs(b.result_spread_diff) - Math.abs(a.result_spread_diff)
        );
        setAgsTable(sortedData);
      }
      setSorted(!sorted);
    }
    return (
      <div style={{ padding: '20px' }}>
      <h1>{point} Season AGS Results</h1>
      {agsTable.length > 0 ? (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Game ID</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Season</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Game Type</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Week</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Gameday</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Weekday</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Gametime</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Away Team</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Away Score</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Home Team</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Home Score</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Spread Line</th>
              <th style={{ border: '1px solid #ccc', padding: '8px', cursor: 'pointer' }} onClick={toggleSort}>
                Result Spread Difference
              </th>
            </tr>
          </thead>
          <tbody>
            {agsTable.map((row, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{row.game_id}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{row.season}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{row.game_type}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{row.week}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{row.gameday}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{row.weekday}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{row.gametime}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                  {
                    teamLogos[row.away_team] ? (
                      <Image
                        src={teamLogos[row.away_team]}
                        alt={row.away_team}
                        width={50}
                        height={50}
                      />
                    ) : (
                      row.away_team
                    )
                  }
                </td>
                <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold', fontSize: '20px'}} >{row.away_score}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                  {
                    teamLogos[row.home_team] ? (
                      <Image
                        src={teamLogos[row.home_team]}
                        alt={row.home_team}
                        width={50}
                        height={50}
                      />
                    ) : (
                      row.home_team
                    )
                  }
                </td>
                <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold', fontSize: '20px' }}>{row.home_score}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{row.spread_line}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{row.result_spread_diff}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading table data...</p>
      )}
    </div>
    );
    
}