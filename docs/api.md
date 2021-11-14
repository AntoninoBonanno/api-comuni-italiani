# APIs

API divided by [**areas**](#areas), [**regions**](#regions), [**provinces**](#provinces) and [**cities**](#cities) with the possibility of filtering the data.

[**Info**](#info) and [**istat-scans**](#istat-scans) API allow you to view information about the service

## API TEST

Import [API Comuni italiani.postman_collection.json](/docs/API%20Comuni%20italiani.postman_collection.json) file in [Postman](https://www.postman.com/downloads/) for test the API

- Change value of variable `baseUri` inside Collection\variables section

## Info

```http
GET /
 ```
**IMPORTANT**: the **first ISTAT scan** (when the database is empty) is started when the **Info API** is fired for the first time

Get system info:

- **message**: Is alive message
- **availableDatabase**: First sheet name of ISTAT xls file from [permalink](https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.xls) (corresponds to the update date of the file)
- **currentDatabase**: First sheet name of ISTAT xls file that was recovered and is available with the API
- **lastCheck**: Datetime the updates were last checked (Other possible values: `In progress`, `Never`)
- **nextCheck**: Datetime of next check for updates (Other possible values: `CronJob unset`)
- **isUpdated**: `true` if the database is aligned with the ISTAT xls file, otherwise `false`
- **_count**: Total of records currently available

**Params**
<table>
  <tr>
    <td><b>Parameter</b></td>
    <td><b>Type</b></td>
    <td><b>Description</b></td>
  </tr>
  <tr>
    <td colspan="3">Does not accept any parameters</td>
  </tr>
</table>

<details>
<summary style="font-size:14px; font-weight: bold;">Example</summary>

```http
GET //localhost:8000/
 ```

```json
{
  "message": "API Comuni Italiani is alive!",
  "availableDatabase": "CODICI al 30_06_2021",
  "currentDatabase": "CODICI al 30_06_2021",
  "lastCheck": "2021-11-10T11:36:38.306Z",
  "nextCheck": "2022-01-01T09:00:00.000Z",
  "isUpdated": true,
  "_count": {
    "areas": 5,
    "regions": 20,
    "provinces": 107,
    "cities": 7904
  }
}
```

</details>

## Areas

### Find by id

```http
GET /api/areas/{id}
 ```

Find an Area resource by id

- **id**: The id of area
- **code**: One character code that takes values in the range 1-5 [`Column I`]
- **name**: Denomination of the geographical division according to the division of the national territory into 5 areas [`Column J`]
- **createdAt**: Creation datetime
- **updatedAt**: Datetime of update
- **deletedAt**: Datetime of elimination. Always `null`, the API does not return the deleted resources
- **_count**: Total of relationships

**Params**

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `id` | `integer` | **Required**. The id of the area to be recovered |

<details>
<summary style="font-size:14px; font-weight: bold;">Example</summary>

```http
GET //localhost:8000/api/areas/1
 ```

```json
{
  "id": 1,
  "code": "1",
  "name": "Nord-ovest",
  "createdAt": "2021-11-10T11:26:36.001Z",
  "updatedAt": "2021-11-10T11:37:54.550Z",
  "deletedAt": null,
  "_count": {
    "regions": 4
  }
}
```

</details>

### List

```http
GET /api/areas
 ```

Get the paginated list of Areas

- **pageSize**: The maximum number of items per page
- **currentPage**: Index of the current page
- **totalPages**: Total number of pages
- **totalItems**: Total number of elements
- **contentList**: Array of Area resource

**Params**

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `pageSize` | `integer` | **Optional**. The number of elements: default `10` |
| `currentPage` | `integer` | **Optional**. The number of page to show: default `0` |
| `name` | `string` | **Optional**. Filter by area name |
| `code` | `string` | **Optional**. Filter by area code |

<details>
<summary style="font-size:14px; font-weight: bold;">Example</summary>

```http
GET //localhost:8000/api/areas?currentPage=0&pageSize=2&name=n
 ```

```json
{
  "pageSize": 2,
  "currentPage": 0,
  "totalPages": 2,
  "totalItems": 3,
  "contentList": [
    {
      "id": 1,
      "code": "1",
      "name": "Nord-ovest",
      "createdAt": "2021-11-10T11:26:36.001Z",
      "updatedAt": "2021-11-10T11:37:54.550Z",
      "deletedAt": null,
      "_count": {
        "regions": 4
      }
    },
    {
      "id": 2,
      "code": "2",
      "name": "Nord-est",
      "createdAt": "2021-11-10T11:26:54.056Z",
      "updatedAt": "2021-11-10T11:36:56.300Z",
      "deletedAt": null,
      "_count": {
        "regions": 4
      }
    }
  ]
}
```

</details>

## Regions

### Find by id

```http
GET /api/regions/{id}
 ```

Find a Region resource by id

- **id**: The id of region
- **areaId**: The id of the associated Area
- **code**: The code of region, Two-character alphanumeric code, valid in the range 01-20 [`Column A`]
- **name**: Denomination of the Region [`Column K`]
- **createdAt**: Creation datetime
- **updatedAt**: Datetime of update
- **deletedAt**: Datetime of elimination. Always `null`, the API does not return the deleted resources
- **_count**: Total of relationships

**Params**

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `id` | `integer` | **Required**. The id of the region to be recovered |

<details>
<summary style="font-size:14px; font-weight: bold;">Example</summary>

```http
GET //localhost:8000/api/regions/1
 ```

```json
{
  "id": 1,
  "areaId": 1,
  "code": "01",
  "name": "Piemonte",
  "createdAt": "2021-11-10T11:26:36.017Z",
  "updatedAt": "2021-11-10T11:37:54.569Z",
  "deletedAt": null,
  "_count": {
    "provinces": 8
  }
}
```

</details>

### List

```http
GET /api/regions
 ```

Get the paginated list of Regions

- **pageSize**: The maximum number of items per page
- **currentPage**: Index of the current page
- **totalPages**: Total number of pages
- **totalItems**: Total number of elements
- **contentList**: Array of Region resource

**Params**

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `pageSize` | `integer` | **Optional**. The number of elements: default `10` |
| `currentPage` | `integer` | **Optional**. The number of page to show: default `0` |
| `name` | `string` | **Optional**. Filter by region name |
| `code` | `string` | **Optional**. Filter by region code |
| `area` | `string` | **Optional**. Filter by area of region: accept `area id`, `area name` |

<details>
<summary style="font-size:14px; font-weight: bold;">Example</summary>

```http
GET //localhost:8000/api/regions?pageSize=2&currentPage=0&area=nord
 ```

```json
{
  "pageSize": 2,
  "currentPage": 0,
  "totalPages": 4,
  "totalItems": 8,
  "contentList": [
    {
      "id": 1,
      "areaId": 1,
      "code": "01",
      "name": "Piemonte",
      "createdAt": "2021-11-10T11:26:36.017Z",
      "updatedAt": "2021-11-10T11:37:54.569Z",
      "deletedAt": null,
      "_count": {
        "provinces": 8
      }
    },
    {
      "id": 2,
      "areaId": 1,
      "code": "02",
      "name": "Valle d'Aosta/Vallée d'Aoste",
      "createdAt": "2021-11-10T11:26:42.867Z",
      "updatedAt": "2021-11-10T11:38:02.177Z",
      "deletedAt": null,
      "_count": {
        "provinces": 1
      }
    }
  ]
}
```

</details>

## Provinces

### Find by id

```http
GET /api/provinces/{id}
 ```

Find a Province resource by id

- **id**: The id of province
- **regionId**: The id of the associated Region
- **code**: Code of the Province in force or ceased (three characters, alphanumeric format) [`Column C`]
- **name**: Name of the province, metropolitan city, free consortium of municipalities or non-administrative units (former provinces of Friuli-Venezia Giulia) [`Column L`]
- **abbreviation**: It is the province's automobile abbreviation [`Column O`]
- **createdAt**: Creation datetime
- **updatedAt**: Datetime of update
- **deletedAt**: Datetime of elimination. Always `null`, the API does not return the deleted resources
- **_count**: Total of relationships

**Params**

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `id` | `integer` | **Required**. The id of the province to be recovered |

<details>
<summary style="font-size:14px; font-weight: bold;">Example</summary>

```http
GET //localhost:8000/api/provinces/1
 ```

```json
{
  "id": 1,
  "regionId": 1,
  "code": "001",
  "name": "Torino",
  "abbreviation": "TO",
  "createdAt": "2021-11-10T11:26:36.031Z",
  "updatedAt": "2021-11-10T11:37:54.578Z",
  "deletedAt": null,
  "_count": {
    "cities": 312
  }
}
```

</details>

### List

```http
GET /api/provinces
 ```

Get the paginated list of Provinces

- **pageSize**: The maximum number of items per page
- **currentPage**: Index of the current page
- **totalPages**: Total number of pages
- **totalItems**: Total number of elements
- **contentList**: Array of Province resource

**Params**

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `pageSize` | `integer` | **Optional**. The number of elements: default `10` |
| `currentPage` | `integer` | **Optional**. The number of page to show: default `0` |
| `name` | `string` | **Optional**. Filter by province name |
| `code` | `string` | **Optional**. Filter by province code |
| `region` | `string` | **Optional**. Filter by region of province: accept `region id`, `region name` |

<details>
<summary style="font-size:14px; font-weight: bold;">Example</summary>

```http
GET //localhost:8000/api/provinces?pageSize=2&currentPage=0&region=piem
 ```

```json
{
  "pageSize": 2,
  "currentPage": 0,
  "totalPages": 4,
  "totalItems": 8,
  "contentList": [
    {
      "id": 1,
      "regionId": 1,
      "code": "001",
      "name": "Torino",
      "abbreviation": "TO",
      "createdAt": "2021-11-10T11:26:36.031Z",
      "updatedAt": "2021-11-10T11:37:54.578Z",
      "deletedAt": null,
      "_count": {
        "cities": 312
      }
    },
    {
      "id": 2,
      "regionId": 1,
      "code": "002",
      "name": "Vercelli",
      "abbreviation": "VC",
      "createdAt": "2021-11-10T11:26:37.981Z",
      "updatedAt": "2021-11-10T11:37:56.737Z",
      "deletedAt": null,
      "_count": {
        "cities": 82
      }
    }
  ]
}
```

</details>

## Cities

### Find by id

```http
GET /api/cities/{id}
 ```

Find a City resource by id

- **id**: The id of city
- **provinceId**: The id of the associated Province
- **code**: City code (in numeric format) [`Column E`]
- **name**: Name of the city in Italian and foreign language [`Column F`]
- **italianName**: Name of the city only in Italian [`Column G`]
- **otherLanguageName**: Name of the city in a language other than Italian [`Column H`]
- **cadastralCode**: (Belfiore code) It is the code assigned to the municipality by the Revenue Agency. (N.d.= not available) [`Column T`]
- **capital**: If it is a capital city [`Column N`]
- **createdAt**: Creation datetime
- **updatedAt**: Datetime of update
- **deletedAt**: Datetime of elimination. Always `null`, the API does not return the deleted resources
- **province**: The Province resource associated

**Params**

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `id` | `integer` | **Required**. The id of the city to be recovered |

<details>
<summary style="font-size:14px; font-weight: bold;">Example</summary>

```http
GET //localhost:8000/api/cities/1
 ```

```json
{
  "id": 1,
  "provinceId": 1,
  "code": "001001",
  "name": "Agliè",
  "italianName": "Agliè",
  "otherLanguageName": null,
  "cadastralCode": "A074",
  "capital": false,
  "createdAt": "2021-11-10T11:26:36.040Z",
  "updatedAt": "2021-11-10T11:37:54.592Z",
  "deletedAt": null,
  "province": {
    "id": 1,
    "regionId": 1,
    "code": "001",
    "name": "Torino",
    "abbreviation": "TO",
    "createdAt": "2021-11-10T11:26:36.031Z",
    "updatedAt": "2021-11-10T11:37:54.578Z",
    "deletedAt": null
  }
}
```

</details>

### List

```http
GET /api/cities
 ```

Get the paginated list of Cities

- **pageSize**: The maximum number of items per page
- **currentPage**: Index of the current page
- **totalPages**: Total number of pages
- **totalItems**: Total number of elements
- **contentList**: Array of City resource

**Params**

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `pageSize` | `integer` | **Optional**. The number of elements: default `10` |
| `currentPage` | `integer` | **Optional**. The number of page to show: default `0` |
| `name` | `string` | **Optional**. Filter by city name |
| `code` | `string` | **Optional**. Filter by city code |
| `cadastralCode` | `string` | **Optional**. Filter by city cadastralCode |
| `capital` | `boolean` | **Optional**. Filter by city capital: accept `true`, `1`, `false`, `0` |
| `province` | `string` | **Optional**. Filter by region of province: accept `province id`, `province name`, `province abbreviation` |

<details>
<summary style="font-size:14px; font-weight: bold;">Example</summary>

```http
GET //localhost:8000/api/cities?currentPage=0&pageSize=2&province=torino
 ```

```json
{
  "pageSize": 2,
  "currentPage": 0,
  "totalPages": 156,
  "totalItems": 312,
  "contentList": [
    {
      "id": 1,
      "provinceId": 1,
      "code": "001001",
      "name": "Agliè",
      "italianName": "Agliè",
      "otherLanguageName": null,
      "cadastralCode": "A074",
      "capital": false,
      "createdAt": "2021-11-10T11:26:36.040Z",
      "updatedAt": "2021-11-10T11:37:54.592Z",
      "deletedAt": null,
      "province": {
        "id": 1,
        "regionId": 1,
        "code": "001",
        "name": "Torino",
        "abbreviation": "TO",
        "createdAt": "2021-11-10T11:26:36.031Z",
        "updatedAt": "2021-11-10T11:37:54.578Z",
        "deletedAt": null
      }
    },
    {
      "id": 2,
      "provinceId": 1,
      "code": "001002",
      "name": "Airasca",
      "italianName": "Airasca",
      "otherLanguageName": null,
      "cadastralCode": "A109",
      "capital": false,
      "createdAt": "2021-11-10T11:26:36.049Z",
      "updatedAt": "2021-11-10T11:37:54.600Z",
      "deletedAt": null,
      "province": {
        "id": 1,
        "regionId": 1,
        "code": "001",
        "name": "Torino",
        "abbreviation": "TO",
        "createdAt": "2021-11-10T11:26:36.031Z",
        "updatedAt": "2021-11-10T11:37:54.578Z",
        "deletedAt": null
      }
    }
  ]
}
```

</details>

## ISTAT Scans

Attempts made to retrieve information from the ISTAT xls file

### Find by id

```http
GET /api/istat-scans/{id}
 ```

Find a IstatScan resource by id

- **id**: The id of scan
- **status**: The status of scan (`PROGRESS`, `COMPLETED`, `ERROR`)
- **databaseName**: First sheet name of scanned ISTAT xls file
- **statusMessage**: Any information messages
- **startAt**: Datetime of start scan
- **endAt**: Datetime of end scan
- **deletedAt**: Datetime of elimination. Always `null`, the API does not return the deleted resources

**Params**

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `id` | `integer` | **Required**. The id of the IstatScan to be recovered |

<details>
<summary style="font-size:14px; font-weight: bold;">Example</summary>

```http
GET //localhost:8000/api/istat-scans/1
 ```

```json
{
  "id": 1,
  "status": "PROGRESS",
  "databaseName": "CODICI al 30_06_2021",
  "statusMessage": null,
  "startAt": "2021-11-10T11:26:34.665Z",
  "endAt": null,
  "deletedAt": null
}
```

</details>

### List

```http
GET /api/istat-scans
 ```

Get the paginated list of IstatScans

- **pageSize**: The maximum number of items per page
- **currentPage**: Index of the current page
- **totalPages**: Total number of pages
- **totalItems**: Total number of elements
- **contentList**: Array of IstatScan resource

**Params**

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `pageSize` | `integer` | **Optional**. The number of elements: default `10` |
| `currentPage` | `integer` | **Optional**. The number of page to show: default `0` |

<details>
<summary style="font-size:14px; font-weight: bold;">Example</summary>

```http
GET //localhost:8000/api/istat-scans
 ```

```json
{
  "pageSize": 10,
  "currentPage": 0,
  "totalPages": 1,
  "totalItems": 1,
  "contentList": [
    {
      "id": 1,
      "status": "PROGRESS",
      "databaseName": "CODICI al 30_06_2021",
      "statusMessage": null,
      "startAt": "2021-11-10T11:26:34.665Z",
      "endAt": null,
      "deletedAt": null
    }
  ]
}
```

</details>


