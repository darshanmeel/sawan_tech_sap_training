# SAP_PRACTICE_SYSTEM.md — Docker, CAL, and Screenshots

Setting up your SAP practice environment for development, validation, and Academy screenshot capture.

---

## Two-Environment Strategy

**Daily development: Docker SAP trial on your laptop** — free, always available, good for CDS experimentation and Python extraction testing

**Screenshot capture + live extraction demos: SAP CAL on GCP** — pay-per-hour, spun up only when needed, produces production-quality screenshots AND supports live Python extractions against real SAP systems (the foundational demo capability for sales)

---

## Environment 1: Docker ABAP Trial (Local)

### What You Get

- Full ABAP development environment
- SAP HANA Express Edition DB
- Limited demo data (client 001 with some sample objects)
- SAP GUI accessible via Windows VM connection or ADT Eclipse

### What You Don't Get

- Full S/4HANA business functionality
- Realistic ACDOCA data (no real finance transactions)
- Production-like screenshots (trial watermark visible)
- Multiple company codes, realistic volumes

### Setup

Prerequisites:
- Docker Desktop (Windows, Mac, or Linux)
- 16GB+ RAM (8GB minimum, 16GB recommended)
- 80GB free disk space
- SAP Community login (free)

Download image from SAP's official Docker Hub:

```bash
docker pull store/saplabs/abaptrial:latest
```

Run with correct port mappings:

```bash
docker run --stop-timeout 3600 -i --name a4h -h vhcala4hci \
  -p 3200:3200 -p 3300:3300 -p 8443:8443 -p 30213:30213 -p 50000:50000 -p 50001:50001 \
  store/saplabs/abaptrial:latest -agree-to-sap-license
```

Wait 15-20 minutes for the container to fully initialize on first run. Login credentials are displayed in the container logs.

**After running:**

1. Install SAP GUI for Windows/Mac/Linux from SAP Community downloads
2. Create a connection: Application server `localhost`, Instance number `00`
3. Login as `DEVELOPER` / password from container logs
4. Start exploring transactions: `SE80`, `SE16N`, `SE11`

### What to Do With It

- Practice CDS view creation in ADT
- Test Python `pyrfc` connections against a real SAP system
- Experiment with authorizations (S_RFC, S_TABU_DIS)
- Validate that your walkthrough steps actually work
- **Not** for production screenshots

### Maintenance

Container state persists between runs. Stop with `docker stop a4h`, restart with `docker start a4h`. If you need to reset, remove the container and re-run.

---

## Environment 2: SAP Cloud Appliance Library (CAL)

### What You Get

- Full S/4HANA, ECC, or BW/4HANA systems
- Pre-configured with demo data (IDES, Global Bike, or Model Company)
- Realistic volumes for screenshot-worthy scenarios
- Multiple company codes, real business processes

### Cost

Pay-per-hour to GCP (recommended), AWS, or Azure (your account, SAP's software):
- **GCP `n2-standard-8` in `europe-west3` (Frankfurt):** ~€0.40/hour — fastest for Hesse users, cheapest among major clouds
- AWS `m5.4xlarge`: ~€2-3/hour
- Azure equivalent: ~€2/hour
- Stop the instance when not using — you pay only while running
- New GCP accounts get $300 free credits — covers your entire Academy launch

### Why GCP

1. **Per-second billing** — no "full hour" minimums like AWS
2. **Frankfurt region** for you in Hesse — sub-20ms latency
3. **Free tier credits** cover months of casual use
4. **GCS integration** — natural target for Python extraction output
5. **BigQuery availability** — lets you extend walkthroughs to GCP-native data platforms later

### Setup

1. Create free SAP Community account if you don't have one
2. Go to `cal.sap.com`
3. Connect a GCP account (preferred) or AWS/Azure
4. Browse the library for:
   - "SAP S/4HANA 2023 Fully Activated Appliance" — best for S/4HANA
   - "SAP ERP 6.0 EHP8" — for ECC walkthroughs
5. Deploy to `europe-west3` (Frankfurt) on GCP for low latency and data residency
6. Wait 2-3 hours for initial provisioning
7. Access via browser-based Fiori Launchpad or SAP GUI over the VPN CAL provides

### Recommended Usage Pattern

**One focused session per major screenshot batch:**

- Session 1: Spin up S/4HANA, capture all S/4HANA walkthrough screenshots (6-8 hours)
- Session 2: Spin up ECC, capture ECC walkthrough screenshots (4-6 hours)
- Session 3: Spot-check and recapture anything that needs fixing (2-3 hours)

Total: 12-17 hours of runtime × €2/hour = ~€35 total for all Academy screenshots forever.

Stop the instance between sessions. You can re-activate later with the same configuration preserved.

---

## Screenshot Capture Workflow

### The Challenge

- SAP GUI is a desktop app — no browser automation
- S/4HANA Fiori is browser-based — Playwright can automate
- Academy needs ~150-200 screenshots across 18 walkthroughs
- Must be high quality (readable at 1200px width), annotated consistently, small file size

### Recommended Tool: Snagit

**Cost:** €50 one-time (Windows/Mac)

**Why Snagit specifically:**
- Scrolling window capture (SAP GUI menus are often taller than screen)
- Consistent annotation templates (arrows, step numbers, callouts)
- Batch processing (apply same template to 50 screenshots at once)
- WebP export with good compression
- Blur/redaction tools for sensitive data (customer names in demo data)

### Alternative: ShareX (Free, Windows only)

If budget is tight, ShareX + some manual annotation work is acceptable. Not as polished.

### Alternative: Playwright (For Fiori only)

For S/4HANA Fiori Launchpad screenshots, Playwright can automate:

```javascript
// scripts/capture-fiori.js
import { chromium } from 'playwright';

async function captureFioriLogin() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('https://your-cal-instance/fiori/');
  
  await page.fill('#USERNAME_FIELD-inner', 'DEMO_USER');
  await page.fill('#PASSWORD_FIELD-inner', 'demopassword');
  await page.click('#LOGIN_LINK');
  
  await page.waitForSelector('.sapUshellTile');
  await page.screenshot({ 
    path: 'screenshots/fiori-launchpad-home.webp', 
    type: 'webp',
    quality: 85 
  });
  
  await browser.close();
}

captureFioriLogin();
```

### Naming Convention

Store in `docs/assets/images/walkthroughs/`:

```
walkthroughs/
  s4hana/
    beginner/
      vbak/
        step-01-se80-search-cds-view.webp
        step-02-se80-view-header.webp
        step-03-su01-user-creation.webp
        ...
    expert/
      acdoca/
        step-01-...
  ecc/
    intermediate/
      bseg/
        step-01-rsa5-business-content.webp
        ...
```

Kebab-case, numbered, descriptive. Matches walkthrough step IDs.

### Image Optimization

After capture, batch-optimize with sharp CLI:

```bash
npm install -g sharp-cli

# Convert all PNG/JPG to WebP
for f in docs/assets/images/walkthroughs/**/*.{png,jpg}; do
  npx sharp -i "$f" -o "${f%.*}.webp" -- webp --quality 85
done

# Resize anything over 1200px wide
npx sharp -i "docs/assets/images/walkthroughs/**/*.webp" resize 1200 --without-enlargement
```

Target: <100KB per screenshot. Academy homepage should total <500KB including all images.

### Annotation Conventions

For consistency across all screenshots:

- **Step number circle:** red circle with white number, top-left of the element
- **Arrow:** red, pointing from text description to the element
- **Highlight box:** yellow rectangle around input fields or buttons
- **Redaction:** grey solid rectangle over any sensitive data (real customer names, real document numbers)

Save an annotation template in Snagit and apply consistently.

### Time Budget

- Snagit setup + template creation: 2 hours
- S/4HANA session captures (6-8 hours CAL runtime)
- ECC session captures (4-6 hours CAL runtime)
- Annotation pass (can be done without CAL running): 4-6 hours
- Optimization and file organization: 1-2 hours

**Total: ~20 hours focused work across 3-5 days.** CAL cost ~€35.

---

## Data for Screenshots

Use only **demo data shipped with CAL appliances**:

- **S/4HANA FAA:** Global Bike company (uses made-up customer names)
- **ECC EHP8 IDES:** IDES (demo) company
- These are explicitly provided by SAP for training purposes — screenshots are fine to publish

**Never screenshot customer data from:**
- Real consulting engagements
- Production systems you have access to
- Any system where data subjects could be identified

If in doubt, redact aggressively.

---

## When Not to Use CAL

- If you're just testing ABAP syntax → Docker trial is faster
- If you need a single-concept screenshot of SE80 → Docker trial works
- If you need ODQMON with multiple active subscriptions → CAL

Use CAL sparingly and with purpose. Docker for learning; CAL for production assets.

---

## The Live Extraction Demo Architecture (GCP Path)

Beyond screenshots, CAL on GCP unlocks **live extraction demos** — real Python extractions from a real SAP system, landing in GCS. This is your most powerful sales asset.

### Architecture

```
GCP project: sap-academy-demos
├── CAL VM (n2-standard-8, europe-west3) — SAP S/4HANA FAA
│   ├── SAP GUI access
│   ├── Fiori Launchpad
│   └── RFC endpoint on port 3300
├── Extraction VM (e2-medium, europe-west3) — Python
│   ├── pyrfc installed
│   ├── Your extraction scripts
│   └── gsutil configured
└── GCS bucket (europe-west3) — target for extracted Parquet
```

### Setup (One-Time, 1-2 Days)

1. Create GCP project `sap-academy-demos`
2. Enable Compute Engine, Cloud Storage, IAM APIs
3. Deploy CAL S/4HANA FAA to `europe-west3`, wait for provisioning
4. Create extraction VM (`e2-medium`, Debian 12) in the same region
5. SSH into extraction VM, install:
   - Python 3.11+
   - SAP NetWeaver RFC SDK (download from SAP Support Launchpad, requires login)
   - `pip install pyrfc pandas pyarrow google-cloud-storage`
6. Create a service account with Storage Object Creator role
7. Create GCS bucket `sap-academy-extracts` with region `europe-west3`

### Per-Demo Session (15 Min Warmup)

1. Start CAL VM from `cal.sap.com` — wait ~10 min for SAP services
2. Start extraction VM via `gcloud compute instances start extract-vm`
3. Confirm RFC connectivity from extraction VM to CAL
4. Run extraction script
5. Verify output in GCS
6. Stop both VMs when done

### Example Extraction Script

`extract_vbak.py` on the extraction VM:

```python
from pyrfc import Connection
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
from google.cloud import storage
from datetime import datetime

# Connect to CAL SAP system
conn = Connection(
    ashost='<CAL_HOST>',
    sysnr='00',
    client='001',
    user='DEMO_USER',
    passwd='<PASSWORD>'
)

# Extract VBAK headers via RFC_READ_TABLE
result = conn.call('RFC_READ_TABLE',
    QUERY_TABLE='VBAK',
    DELIMITER='|',
    ROWCOUNT=10000,
    FIELDS=[
        {'FIELDNAME': 'VBELN'},
        {'FIELDNAME': 'AUART'},
        {'FIELDNAME': 'ERDAT'},
        {'FIELDNAME': 'VKORG'},
        {'FIELDNAME': 'NETWR'},
    ]
)

# Parse to DataFrame
rows = [row['WA'].split('|') for row in result['DATA']]
columns = [f['FIELDNAME'] for f in result['FIELDS']]
df = pd.DataFrame(rows, columns=columns)

# Write as Parquet to GCS
timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
local_path = f'/tmp/vbak_{timestamp}.parquet'
table = pa.Table.from_pandas(df)
pq.write_table(table, local_path)

client = storage.Client()
bucket = client.bucket('sap-academy-extracts')
blob = bucket.blob(f'vbak/full-load/{timestamp}.parquet')
blob.upload_from_filename(local_path)

print(f"Extracted {len(df)} rows to gs://sap-academy-extracts/vbak/full-load/{timestamp}.parquet")
```

### What You Do With This

**Per Academy walkthrough:**

1. Walk through the SAP-side steps while capturing with Snagit
2. Run the extraction script while recording terminal output
3. Open the resulting Parquet in a pandas notebook — final screenshot shows the data
4. Store everything in private repo under `demos/[walkthrough-slug]/`

**For sales calls:**

1. Start CAL 15 minutes before the call
2. When the prospect says "does this actually work?", share screen
3. Run the extraction live — VBAK or LFA1 in under 60 seconds
4. Show Parquet in Snowflake/BigQuery/Databricks (pick based on prospect's stack)
5. Close with "this runs in your environment too"

**For cornerstone articles:**

- Screenshots include real pipeline output, not mockups
- Real benchmark claims ("measured 8,437 rows in 4.2 seconds")
- Every walkthrough has a working code reference

### Monthly Cost

Active build/capture period:
- CAL running 30 hours/month: €12
- Extraction VM running 30 hours/month: €0.60
- GCS storage 10GB: €0.20
- **Total: ~€15/month while actively building content**

Dormant period (archiving only):
- Both VMs stopped: €0
- GCS storage: €0.20/month

New GCP accounts get $300 in free credits — covers roughly a year of active use.

### Extension for ECC Content

Once S/4HANA is solid, repeat with ECC:

1. Deploy "SAP ERP 6.0 EHP8" from CAL to GCP
2. Keep the same extraction VM (connects to either system)
3. Capture ECC-specific walkthroughs (BSEG, MATDOC, RSA7 flows)

---

## Decommissioning

After all screenshots are captured:

1. Archive the CAL instance (not delete — SAP keeps the configuration)
2. Remove active compute instances (stop the AWS/Azure VM)
3. Keep your CAL account — you can re-activate the appliance for updates later

Your screenshot library lives permanently in the private repo. CAL is only for refresh and new content.
