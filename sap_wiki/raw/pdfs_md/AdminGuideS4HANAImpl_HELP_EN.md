<!-- image -->

Administration Guide | PUBLIC 2024-07-05

## Administration Guide to Implementation of SAP S/4HANA 2021 with SAP Best Practices

<!-- image -->

| Transaction Code        | Description                                                 |
|-------------------------|-------------------------------------------------------------|
| SMICM                   | ICM Monitor                                                 |
| SMLT                    | Language Management                                         |
| SNOTE                   | SAP Note Assistant                                          |
| SPRO                    | Reference IMG                                               |
| SR13                    | Change View "Administration: Display of the SAP Library"    |
| SSFA                    | Change View "Application-Specific SSF Parameters": Overview |
| STC01                   | Task Manager for Technical Configuration                    |
| STRUST                  | Trust Manager                                               |
| SU01                    | User Maintenance                                            |
| SU53                    | Display Authorization Data                                  |
| SWU3                    | Automatic Workflow Customizing                              |
| SXMB_ADM                | Integration Engine: Administration                          |
| SXMSIF                  | Display View "Sender/Receiver Definition": Overview         |
| /N/SMB/BBI              | Solution Builder                                            |
| /N/SMB/SCOPE            | Display View "Customer Solution": Overview                  |
| /N/SMB/ CONFIG_GUIDE_UI | Generated Configuration Information                         |

## 2 Prerequisite Settings

This section describes the prerequisite settings for providing content.

##  Note

If you are using SAP GUI 7.50, carry out the following procedure (the MM01 eCATT currently fails with the default theme):

1. In the SAP GUI 7.50 Logon, expand Visual Design and choose Theme Preview/Settings .
2. The Blue Crystal Theme appears by default in the Theme drop-down box. To proceed with this theme, continue with step 3. To choose any other theme, skip step 3 and continue with step 4.
3. Deselect Accept SAP\_Fiori visual theme .
4. Choose OK .

When the SAP Best Practices activation is completed, you can activate the SAP Fiori visual theme again.

Carry out the settings described in the following subsections:

- Required Enterprise Business Functions [page 7]
- Setting Up a New Best Practices Client - Client Setup Alternatives [page 10]
- Carrying Out Technical Setup [page 17]
- Carrying Out Settings for Implementation [page 38]

## 2.1 Required Enterprise Business Functions

This section describes the prerequisite Enterprise Business Functions that you activate after installing SAP S/4HANA.

Activate the Business Functions in the table below after installing SAP S/4HANA, but before activating the SAP Best Practices for SAP S/4HANA solution.

##  Caution

- The activation of Enterprise Extensions, Business Functions, and Business Function Sets changes your system and cannot be rolled back. For more information about the impact, check the documentation of the related extension or business function.
- Activate all Business Functions as outlined in the table below before you create the client in which the SAP Best Practices for SAP S/4HANA solution shall be activated.
- Do not activate additional Enterprise Extensions or Business Functions (in addition to the required BF mentioned for SAP BP deployment) before content activation. This can result in errors during activation of SAP Best Practices content. Additional Business Functions can be activated anytime after content activation, but this requires regression testing of the business processes as it is usually part of any system maintenance activities.

.

<!-- image -->

| Product   | Business Function      | Configuration or Data required   | Relevance                                                                                                           |
|-----------|------------------------|----------------------------------|---------------------------------------------------------------------------------------------------------------------|
| S4CORE    | FIN_FSCM_CLM           |                                  | Required for scope items J77, J78, 2O0, 4X8, and 3L5 (building blocks BFD, BFE, BFF, 40X, and 3TF) / all FPs  Note |
| S4CORE    | FIN_FSCM_BNK           |                                  | Required for scope item J78 (building blocks J83, BF4) / all FPs  Note Requires an additional license.             |
| S4CORE    | FIN_LOC_SRF            |                                  | Required for scope item 1J2 (building block BRS) / all FPs  Note Requires an additional license.                   |
| S4CORE    | LOG_EAM_CI_8           |                                  | Required for scope items BH1, BH2 and BJ2 (building blocks BFI, BFJ, BFMand BFN), and for scope items 4HHand 4HI    |
| S4CORE    | LOG_EAM_SIMPLICITY     |                                  | Required for scope items BH1, BH2 and BJ2 (building blocks BFI, BFJ, BFMand BFN), and for scope items 4HHand 4HI    |
| S4CORE    | LOG_EAM_SIMPLIC- ITY_2 |                                  | Required for scope items BH1, BH2 and BJ2 (building blocks BFI, BFJ, BFMand BFN), and for scope items 4HHand 4HI    |
| S4CORE    | LOG_EAM_SIMPLIC- ITY_3 |                                  | Required for scope items BH1, BH2 and BJ2 (building blocks BFI, BFJ, BFMand BFN), and for scope items 4HHand 4HI    |
| S4CORE    | LOG_EAM_SIMPLIC- ITY_4 |                                  | Required for scope items BH1, BH2 and BJ2 (building blocks BFI, BFJ, BFMand BFN), and for scope items 4HHand 4HI    |
| S4CORE    | LOG_EAM_SIMPLIC- ITY_5 |                                  | Required for scope items BH1, BH2 and BJ2 (building blocks BFI, BFJ, BFMand BFN), and for scope items 4HHand 4HI    |

| Product   | Business Function       | Configuration or Data required   | Relevance                                                                                                                                            |
|-----------|-------------------------|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| S4CORE    | LOG_EAM_SIMPLIC- ITY_6  |                                  | Required for scope items BH1, BH2 and BJ2 (building blocks BFI, BFJ, BFMand BFN), and for scope items 4HHand 4HI                                     |
| S4CORE    | LOG_EAM_SIMPLIC- ITY_7  |                                  | Required for scope items BH1, BH2 and BJ2 (building blocks BFI, BFJ, BFMand BFN), and for scope items 4HHand 4HI                                     |
| S4CORE    | LOG_EAM_SIMPLIC- ITY_8  |                                  | Required for scope items BH1, BH2 and BJ2 (building blocks BFI, BFJ, BFMand BFN), and for scope items 4HHand 4HI                                     |
| S4CORE    | LOG_EAM_SIMPLIC- ITY_9  |                                  | Required for scope items 4X5, BJ2, 4HI                                                                                                               |
| S4CORE    | LOG_EAM_SIMPLIC- ITY_10 |                                  | Required for scope items 4X5, BJ2, 4HI                                                                                                               |
| S4CORE    | LOG_EAM_SIMPLIC- ITY_11 |                                  | Required for scope items 4X5, BJ2, 4HI                                                                                                               |
| S4CORE    | LOG_EAM_SIMPLIC- ITY_12 |                                  | Required for scope items 4X5, BJ2, 4HI                                                                                                               |
| S4CORE    | LOG_EAM_IME_1           |                                  | Required for scope items 4HH, 4HI                                                                                                                    |
| S4CORE    | LOG_MMFI_P2P            |                                  | Required for the integration of Materials Management and Financial Accounting; purchase order-related down payments in logistic invoice verification |
| S4CORE    | FICAC_CI                |                                  | Required for scope items 2BG, 2BE, 2T3, 3DX, 2KF, 42L, 2AR, 2BI, 2BK, 2DP, 2KH, 2SJ, 2UJ, 33X, 43Y, and 3L3  Note Requires an additional license.   |
| S4CORE    | FICAC_CORE              |                                  | Required for scope items 2BG, 2BE, 2T3, 3DX, 2KF, 42L, 2AR, 2BI, 2BK, 2DP, 2KH, 2SJ, 2UJ, 33X, 43Y, and 3L3  Note Requires an additional license.   |

## Activating Enterprise Business Functions

## Prerequisites

You are authorized to make changes in transaction SFW5 ( Switch Framework ).

## Procedure

1. Start transaction SFW5 .
2. On the Switch Framework: Change Business Function Status screen, select each of the entries listed above (by selecting the Planned Status column).
3. Choose the Activate Changes button.
4. The system displays an informational dialog box. Choose Continue .
5. Choose Back .

## 2.2 Setting Up a New Best Practices Client - Client Setup Alternatives

This chapter describes the three alternatives for setting up a Best Practices Client.

When you implement SAP S/4HANA, you have to create a new so-called Best Practices client (BP client). The BP client setup is the prerequisite for successfully activating and deploying the SAP Best Practices content.

|   Alternative | Name                                                                  | BP Content   | Client 000 Con- tent   | Initial Configura- tion Effort in Areas Covered by BP   | Initial Configura- tion Effort in Areas Not Cov- ered by BP   |
|---------------|-----------------------------------------------------------------------|--------------|------------------------|---------------------------------------------------------|---------------------------------------------------------------|
|             1 | Best Practices cli- ent (BP Client)                                   | Yes          | No                     | Lower                                                   | Higher - 2                                                    |
|             2 | Merged client (with all client 000 reference settings and BP content) | Yes          | Yes                    | Lower                                                   | Lower                                                         |

| Alternative                                           | Name                       | BP Content   | Client 000 Con- tent   | Initial Configura- tion Effort in Areas Covered by BP   | Initial Configura- tion Effort in Areas Not Cov- ered by BP   |
|-------------------------------------------------------|----------------------------|--------------|------------------------|---------------------------------------------------------|---------------------------------------------------------------|
| 3                                                     | Classic client             |              |                        |                                                         |                                                               |
| (Not an option for Best Practices content activation) | (existing configu- ration) | No           | Yes                    | Higher - 1                                              | Lower                                                         |

- 2: Best Practices content is a ready-to-run model company with documented processes. The effort to make a ready-to-run configuration from the client 000 content (shipment configuration) is considerably higher.

To make the correct choice for the tenant setup, consider the following:

- If your scope is large and isn't covered by Best Practices content: choose a merged client
- If the Best Practices content covers all or nearly all of your requirements (based on a review of the delivered process flows) : choose a Best Practices client
- If you use configuration from another template or existing system: choose a classic client

##  Note

Once you make your choice, you can't change the strategy during the setup. If your requirements change, you must start the setup again.

##  Caution

In the classic client, you can't activate Best Practices. It creates its own enterprise structure and other configuration that overwrites existing business processes in some cases.

## Related Information

Alternative 1: Setting Up a Best Practices Client [page 12]

Alternative 2 - Setting Up a Merged Client (All Client 000 Reference Settings) [page 14]

Guidance on Copying Missing Client 000 Settings in a Best Practices Client [page 13]

Handling Language Imports [page 15]

## 2.2.1  Alternative 1: Setting Up a Best Practices Client

## Prerequisites

You've configured the table /FTI/T\_NOCLN000 so that the new client you create contains only specified configuration data and not the complete configuration data from client 000. Table /FTI/T\_NOCLN000 (clientindependent) contains a list of clients that should be created as Best Practices client. The client copy program only recognizes clients that are listed in this table as Best Practices clients. Otherwise, the client is created with the complete configuration data from client 000.

##  Tip

If you need client 000 settings during implementation, try the steps described in Guidance on Copying Missing Client 000 Settings in a Best Practices Client [page 13]. This process, however, has its own limitations.

## Procedure

1. Check if the new Best Practices client is registered in the table /FTI/T\_NOCLN000 . If it hasn't been registered, add a new record with the target client number.
2. Define a new Best Practices client using transaction SCC4 .

In New Entries: Details of Added Entries , set the properties of the new Best Practices client as indicated in the following table:

| Property                                           | Value                                                      |
|----------------------------------------------------|------------------------------------------------------------|
| Client role                                        | Customizing                                                |
| Changes and Transports for Client-Specific Objects | Automatic recording of changes                             |
| Cross-Client Object Changes                        | Changes to repository and cross-client customizing allowed |
| Client Copy and Comparison Tool Protection         | Protection level 0: No restriction                         |
| CATT and eCATT restrictions                        | eCATT and CATT allowed                                     |

3. Create YOUR\_INSTALLATION\_USER as a technical user by copying user DDIC in client 000.
4. Run the client copy in client 000 by starting transaction SCCLN . In the client copy program, you can use the copy profile SAP\_U000 . This copy profile copies only tables from client 000 that are referenced in the include list. (Table /FTI/TWHITEL01 contains a list of tables that the system copies from client 000.) We recommend setting it up as a background job to avoid timeouts. You can monitor the progress with transaction SCC3 .

5. Log on to the target client using YOUR\_INSTALLATION\_USER and activate the SAP Best Practices content.
6. For security reasons, after you have completed the content activation, please deactivate YOUR\_INSTALLATION\_USER .

## Related Information

Guidance on Copying Missing Client 000 Settings in a Best Practices Client [page 13]

## 2.2.1.1 Guidance on Copying Missing Client 000 Settings in a Best Practices Client

## General Guidance on Copying Client 000 Settings

- Enter the required configuration settings using the IMG (transaction SPRO ).
- Use the adjustment functionality (in the maintenance UI of the IMG activity, go to Utilities Adjustment ) to select and copy table entries from client 000 to your actual client.
- In exceptional cases, manual entry on the UI in the IMG isn't possible (the case for a small number of G-tables and for none of the C-tables). In such a case, use report /FTI/JF24 to copy G-table entries of complete application components from client 000 to the actual client. The /FTI/JF24 report is not a mass copy tool. It only copies the G-table entries of an application component and not the C-table content. The report is generic and doesn't ensure any relational consistency or checks. Manual entry in the IMG UI or using the adjustment functionality considers the checks.
- In the case that
- you need all table entries for an IMG activity,
- there are too many tables for manual entry,
- the IMG activity doesn't offer the adjustment functionality,
- you can use report /FTI/JF24 and copy all the data of one IMG activity as required. In this case, C-table entries are also copied, but relational consistency and checks aren't considered, as the report is generic.
- In some cases, the system displays an error message stating that table entries of a customizing table are missing if you use the usual application UIs. If you don't know where to enter the entries in IMG, use report /FTI/JF01 and enter the table as a parameter to determine which IMG activities exist. Navigate directly to the IMG UI by clicking the IMG activity ID on the result list.

## Detailed Information for Using Report /FTI/JF24

- If you execute the report in Simulation mode, the report is read-only and is therefore safe.

- If you select Write only if table is empty , the report copies only the entries from client 000 into the actual client for those tables that are empty in the actual client.
- If you select Insert new lines , the report copies entries from client 000 for all tables that have a different number of entries in client 000 than in the actual client. It inserts entries, meaning existing table lines aren't changed (even if they have different content in client 000 than in the actual client).
- If you run the report without simulation mode, you must enter an open task in a customizing transport. (You must be the owner of this task.) You can't run the report /FTI/JF24 on a productive client, so you must transport the changes. Create the task in advance in transaction SE09 . The keys of the copied table lines are listed in the task. Y ou can use the customizing transport to transport the changes to the clients in other systems.

## 2.2.2  Alternative 2 - Setting Up a Merged Client (All Client 000 Reference Settings)

## Prerequisites

Check table /FTI/T\_NOCLN000 and make sure that the client number doesn't exist in the table.

##  Caution

The table is client independent.

##  Note

If you choose the merged client alternative, additional activation errors occur because the client 000 settings already exist and the Best Practices activation tries to populate the same configuration. For guidance, see SAP Note 3096191 ( Implementation of SAP S/4HANA SAP Best Practices 2021 (on premise) - Activation in a Merged Client ). All business processes aren't tested in a merged client and you may raise an incident if you get any process errors.

##  Caution

Review Conversion Factors (table TCURF )

In a merged client, the client 000 settings in table TCURF will not be overwritten by SAP Best Practices content. During the activation, additional settings will be created instead. You will therefore have two type 'M' entries (Standard translation at average rate) for several currency pairs. Technically, this is caused by the validity date (the more recent settings take effect). The client 000 settings do not get overwritten because their validaty date is after (and therefore more recent than) the validity date of the Best Practices content.

Note that the settings in field Alternative Exchange Rate Type ( ABWCT ) originate from client 000 only. If you decide that you do not want to use these settings, you have to manually adjust the currency translation ratios and create entries with a validity date that is later than 01.01.1800.

## Procedure

1. Define a new Best Practices client using transaction SCC4 .

In New Entries: Details of Added Entries , set the properties of the merged client as indicated in the following table:

| Property                                           | Value                                                      |
|----------------------------------------------------|------------------------------------------------------------|
| Client role                                        | Customizing                                                |
| Changes and Transports for Client-Specific Objects | Automatic recording of changes                             |
| Cross-Client Object Changes                        | Changes to repository and cross-client customizing allowed |
| Client Copy and Comparison Tool Protection         | Protection level 0: No restriction                         |
| CATT and eCATT restrictions                        | eCATT and CATT allowed                                     |

2. Create YOUR\_INSTALLATION\_USER as a technical user by copying user DDIC in client 000.
3. Run the client copy in client 000 by starting transaction SCCLN . In the client copy program, you can use the copy profiles SAP\_UCUS , SAP\_CUST , SAP\_CUSV , or SAP\_UCSV . We recommend setting it up as a background job to avoid timeouts. You can monitor the progress with transaction SCC3 .
4. Log on to the target client using YOUR\_INSTALLATION\_USER and activate the SAP Best Practices content.
5. For security reasons, after you have completed the content activation, please deactivate YOUR\_INSTALLATION\_USER .

## 2.2.3  Handling Language Imports

In a language import, translations from SAP for sample data or default values are imported without overwriting the Customizing data in a customer client.

The import of the required languages must be complete before you copy customer tables from client 000 to the new client. This sequence ensures that the customer tables from the client 000 include list contain the latest translations when they're copied. All other translations related to customer tables are provided by the SAP Best Practices content (available in 38 languages). Depending on the selected business scope, these translations are available after content activation.

##  Note

SAP Best Practices Solution Builder automatically identifies your installed languages and imports only the relevant translations during the import of installation data.

##  Caution

To avoid errors during content activation, don't use report RSREFILL or Client maintenance in transaction SMLT to update translations from customer tables in client 000 in your target client. Otherwise, the target client contains too many table entries that are unrelated to your business scope and potentially interfere with the activation logic.

##  Note

Adding further language translations after the solution has been activated isn't supported. For this reason, identify and install all required languages you may also need in the future. Refer to this blog post for information on how to import languages efficiently.

| AR   | Arabic    | HI   | Hindi      | PT   | Portuguese     |
|------|-----------|------|------------|------|----------------|
| BG   | Bulgarian | HR   | Croatian   | RO   | Romanian       |
| CA   | Catalan   | HU   | Hungarian  | RU   | Russian        |
| CS   | Czech     | IT   | Italian    | SH   | Serbo-Croatian |
| DA   | Danish    | JA   | Japanese   | SK   | Slovak         |
| DE   | German    | KK   | Kazakh     | SL   | Slovenian      |
| EL   | Greek     | KO   | Korean     | SV   | Swedish        |
| EN   | English   | LT   | Lithuanian | TH   | Thai           |
| ES   | Spanish   | LV   | Latvian    | TR   | Turkish        |
| ET   | Estonian  | MS   | Malay      | UK   | Ukrainian      |
| FI   | Finnish   | NL   | Dutch      | VI   | Vietnamese     |
| FR   | French    | NO   | Norwegian  | ZF   | Chinese trad.  |
| HE   | Hebrew    | PL   | Polish     | ZH   | Chinese        |

To avoid errors, make sure that the installed languages in transaction SMLT , the logon languages classified in the NLS installation tool, and the enabled languages in the instance profile are the same.

- Classify logon languages in transaction SMLT : Goto Other Tools NLS installation tool
- Check languages in instance profile: start transaction RZ11 and display the value for parameter zcsa/ installed\_languages .

## More information

## [General information about language imports](https://help.sap.com/docs/ABAP_PLATFORM_NEW/4a368c163b08418890a406d413933ba7/4d8a719cf8da0d6ae10000000a42189e.html?version=202110.latest)

When setting up the best-practice client, consider the client currency setting: Editing Client Currency Setting [page 17]

## 2.2.4  Editing Client Currency Setting

## Context

The client currency setting is created during content activation. Make sure that the client currency has not been maintained before the content activation.

##  Caution

After your solution has been activated and the standard currency has been set, you cannot change this setting.

## Procedure

1. Start transaction SCC4 .
2. Select your activation client.

Choose Display . Ensure that there is no entry for standard currency .

## 2.3 Carrying Out Technical Setup

Complete the following activities before you start with the activation of SAP Best Practices content. Carry out each step and follow the instructions in the linked topics or external documentation.

|   Step | Step Description                                                                                 | More Information                                                                                                                                                                                                                    |
|--------|--------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|      1 | For content activation, ensure that you have installed the appropriate SAP front- end components | In the SAP Software Download Center (https:/ /support.sap.com/ swdc), choose Support Packages and Patches Browse our Download Catalog SAP Frontend Components . Select the SAP front-end components depending on your requirements. |
|      2 | Apply SAP notes and check latest informa- tion                                                   | See subsection SAP Notes and Messages [page 20]                                                                                                                                                                                     |

|   Step | Step Description                                                                         | More Information                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
|--------|------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|      3 | Execute basic SAP Fiori configuration                                                    | SAP Fiori configuration is described in detail at http:/ / help.sap.com/s4hana: <Your on-premise edition> under Discover Product Assistance Enterprise Technology SAP Fiori SAP Fiori Overview . With SAP S/4HANA, all new func- tions, features, and innovations are accessible in the SAP Fiori launchpad. You use the launchpad can call up all apps for which you have been granted access. These can be SAP Fiori apps, as well as apps based on Web Dynpro and SAP GUI for HTMLtech- nology. SAP Fiori Overview explains how to setup a front end server including the SAP Fiori launchpad, and how to implement the indi- vidual apps. The guide is intended for system administrators and technical consultants. Apply the settings as described at http:/ /help.sap.com/s4hana: <Your on-premise edition> under Discover Product Assistance Enterprise Technology SAP Fiori SAP Fiori Overview .  Note |
|      4 | Tax calculation for US sales and purchases                                               | The US solution for SAP S/4HANA 2021 (BP_OP_ENTPR_S4HANA2021_USV8.XML) is delivered with in- ternal tax calculation. It includes sample jurisdiction codes and sample rates so that you can execute the SAP Best Practices test scripts out of the box. For productive purposes, replace the sample jurisdiction codes and rates with your own user defined jurisdiction codes and actual tax rates. If you use an external tax provider, configure the required settings.                                                                                                                                                                                                                                                                                                                                                                                                                                       |
|      5 | Configure system to connect to the Sys- tem Landscape Directory of SAP NetWea- ver (SLD) | For more information, see the SAP Help Portal: Configuring, Working with and Administering System Landscape Directory                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
|      6 | Create basic settings in the SAP S/4HANA back end system                                 | Create settings as described in the following sections: Deselecting Activation Links in BCSets [page 28] Configuring Proxy Settings [page 29]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

|   Step | Step Description                                                                | More Information                                                                                                                                                                                                                                                                                                                               |
|--------|---------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|      7 | Create basic settings for using SAP Fiori Launchpad (back end system) [page 29] | Create additional settings as described in the following subsec- tions: Assigning Business Roles to a User [page 31] Creating Back End Authorization Roles [page 33]                                                                                                                                                                           |
|      8 | Set up SAP S/4HANA attachment services (back end system)                        | Create settings as described in the following sections: Maintaining Settings for Storage Systems [page 34] Maintaining SICF Node [page 35] Maintaining Categories for SOMUandDMS_C1_ST [page 36] Activating Storage Repository [page 36] Maintaining Standard Category for SOFFDB [page 37] Adjusting the Customizing in Table TSOPE [page 38] |
|      9 | Set up SAP S/4HANA attachment services (front-end system) [page 38]             |                                                                                                                                                                                                                                                                                                                                                |
|     10 | Set up e-mail exchange between the SAP system and SMTPmail server               | For more information, see the SAP Help Portal: SMTPConfiguration Guide                                                                                                                                                                                                                                                                         |

## 2.3.1  Exporting Metadata Lists for Fiori UI Add-Ons and OData Services

## Context

The required metadata to implement SAP Fiori apps can be exported from the SAP Fiori apps reference library. The SAP Best Practices for SAP S/4HANA package currently uses the following three UI add-ons:

- UI for S4CORE (UIS4HOP1)
- UI for Basis Applications (UIBAS001)
- UI for SFIN (UIAPFI70)

This section describes how to export the metadata required to activate all apps of this software component version.

##  Caution

Check the Software and delivery requirements to get information on the latest component versions.

## 3.5.1.5.2.4  Setting Up RFC Destination to SAP S/4HANA ERP System in SAP S/4HANA Decentralized EWM System

## Context

Communication between the systems is based on the RFC interface, where Remote Function Calls (RFCs) manage the communication process, parameter transfer, and error handling between different systems. To set up these functions in your systems, you need to define RFC destinations in your system landscape.

## Procedure

1. Access the transaction using one of the following navigation options:
2. On the Configuration of RFC Connections screen, choose Create .
3. On the RFC Destination screen, make the following entries:
4. Choose Enter .
5. Go to the Technical Settings tab and make the following entries:

| Transaction Code   | SM59                                                                                                                           |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------|
| SAP ERP IMG menu   | ABAP Platform → Application Server → IDoc Interface / Application Link Enabling (ALE) → Communication → Create RFC Connections |

<!-- image -->

<!-- image -->

| Field Name      | Entry                                                    |
|-----------------|----------------------------------------------------------|
| RFC Destination | <SAP ERP system name> CLNT <client>  Example ERPCLNT001 |
| Connection Type | 3 (Connection to ABAP system)                            |
| Description 1   | RFC Destination to SAP S/4HANA ERP System                |

| Field Name       | Entry                          |
|------------------|--------------------------------|
| Load Balancing   | No                             |
| Target Host      | <SAP ERP target host name>     |
| System Number    | <SAP ERP target system number> |
| Save as Hostname | X                              |

## 3.8.1  Workaround for Manually Transporting the Payment Card Type

## Context

The following procedure is a workaround for a missing transport of payment card type 93 to the production system. Perform the following steps to manually transport the settings (relevant for scope item 1Z1, building block 2DJ, all country versions, affected building blocks 2CU, 2E6, 2B3):

## Procedure

1. Log on to the Q system and start transaction SE01 .
2. Choose the Display tab.
3. Choose an existing customizing request which is ready for release to the production system or create a customizing request by entering a description, project and transport target.
4. In the Transport Organizer: Requests overview screen, open the tree of the relevant customizing request and double-click on the Customizing Task level.
5. Switch to change mode.
6. Choose the Object tab. Make the following entries:
7. In the Function column, choose the bottom Object with keys button.
8. In the Table Name field enter TFPLA and choose Enter .
9. Double-click the new row and make the following settings:
10. Choose Continue .
11. In a new row, in the Table Name field enter TFPLB and choose Enter .
12. Double-click the new row and make the following settings:

| Field       | Input Value     |
|-------------|-----------------|
| Program ID  | R3TR            |
| Object Type | VDAT            |
| Object Name | V_TFPLA_T_TRANS |

| Field           | Input Value                 |
|-----------------|-----------------------------|
| Client          | <Client number of Q system> |
| BillingPlanType | 93                          |

| Field           | Input Value                               |
|-----------------|-------------------------------------------|
| Client          | <Client number of Q system>               |
| Language        | <Language Key, for example E for English> |
| BillingPlanType | 93                                        |

13. Choose Continue .
14. Choose Save .
15. Release the transport request to the Production system.

## 3.9 Handling Data Migration Content

In S/4HANA (on premise), there are two options to migrate data into SAP HANA. This section describes two alternatives for handling data migration content.

## Alternative 1: SAP Data Services

To migrate data into an S/4HANA (on premise) system, SAP recommends using SAP Data Services. SAP offers content that is free of charge to speed up the data migration. On the SAP Best Practices Explorer, you can find content that is specifically created for the new SAP S/4HANA target system, its interfaces and data structures. The content is free of charge and can be downloaded under rapid data migration to SAP S/4HANA (on premise) V6.42 .

## Alternative 2: SAP S/4HANA Migration Cockpit

Customers implementing SAP Best Practices for S/4HANA can take advantage of the SAP S/4HANA Migration Cockpit that is built-in to SAP S/4HANA. There are two migration approaches available:

- [A file based migration approach for new SAP customers](https://help.sap.com/viewer/29193bf0ebdd4583930b2176cb993268/2021.latest/en-US/9bea452cfae3493eb1aee55d8dbaa07c.html)
- [Migration of data from a source SAP system for existing customers](https://help.sap.com/viewer/29193bf0ebdd4583930b2176cb993268/2021.latest/en-US/7a62b59726ce42e7a10770b06940f934.html)

##  Note

Before using the SAP S/4HANA Migration Cockpit, check the available content. For the general positioning of tools, refer to SAP Note 2287723 .

## 3.10  Known Issues

## 3.10.1  Preventing Out of Memory Dumps

## Context

Some activities like the upload of installation data or defining the scope of customer solutions might cause a high memory consumption. Problems can be prevented by setting the memory quotas high enough. Allowing up to 6 GB HEAP memory per session should help to avoid memory related short dumps. After activating the SAP Best Practices for SAP S/4HANA solution, the memory settings have to be reverted back to the original value .

## Procedure

1. Open transaction RZ10 .
2. Set the parameter abap/heap\_area\_dia to 6 GB.
3. [For more information see: abap/heap\_area\_dia: Heap Memory Limit for Dialog Work Processes](https://help.sap.com/saphelp_nw70/helpdata/en/02/9626c0538111d1891b0000e8322f96/content.htm)
3. Make sure that the parameter PHYS\_MEMSIZE is set correctly. Y ou can find more information about the correct settings in the documentation for the parameter (click on the Display Documentation icon).
4. Restart the server.
6.  Remember Revert the settings back to the original value after activating the solution.

<!-- image -->