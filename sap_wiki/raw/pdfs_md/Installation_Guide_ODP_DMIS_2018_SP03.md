## Installation Guide

SAP Landscape Transformation Replication Server Document Version: 1.0 -2020-02-26

Operational Data Provisioning in Real-time with SAP Landscape Transformation Replication Server

<!-- image -->

CUSTOMER

## Typographic Conventions

| Type Style   | Description                                                                                                                                                                                                                      |
|--------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Example      | Words or characters quoted from the screen. These include field names, screen titles, pushbuttons labels,menu names,menu paths,andmenu options. Textual cross-references to other documents.                                     |
| Example      | Emphasized words or expressions.                                                                                                                                                                                                 |
| EXAMPLE      | Technical names of system objects. These include report names, program names, transaction codes, table names, and key concepts of a programming language when they are surrounded by body text, for example, SELECT and INCLUDE. |
| Example      | Output on the screen. This includes file and directory names and their paths, messages, names of variables and parameters, source text, and names of installation, upgrade and database tools.                                   |
| Example      | Exact user entry. These are words or characters that you enter in the system exactly as they appear in the documentation.                                                                                                        |
| <Example>    | Variable user entry. Angle brackets indicate that you replace these words and characters with appropriate entries to make entries in the system.                                                                                 |
| EXAMPLE      | Keys on the keyboard, for example, F2 or ENTER .                                                                                                                                                                                 |

## Document History

|   Version | Date       | Change                                                                                            |
|-----------|------------|---------------------------------------------------------------------------------------------------|
|       1.0 | 2020-02-26 | Initial version for SAP Landscape Transformation Replication Server DMIS_2018 support package 03. |

## Table of Contents

|   1 | Getting Started..............................................................................................................................5      | Getting Started..............................................................................................................................5      |
|-----|-----------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| 1.1 | About this Document.......................................................................................................................5         | About this Document.......................................................................................................................5         |
| 1.2 | Related Information.........................................................................................................................5       | Related Information.........................................................................................................................5       |
|     | 1.2.1                                                                                                                                               | Related Documentation and Guides for Operational Data Provisioning.........................5                                                        |
|     | 1.2.2                                                                                                                                               | SAP LT Replication Server Guides...................................................................................6                                |
| 1.3 | Important SAPNotes ......................................................................................................................6          | Important SAPNotes ......................................................................................................................6          |
|   2 | Planning..........................................................................................................................................8 | Planning..........................................................................................................................................8 |
| 2.1 | Introduction.....................................................................................................................................8  | Introduction.....................................................................................................................................8  |
| 2.2 | Installation of SAP LT Replication Server on a Separate System................................................. 10                                  | Installation of SAP LT Replication Server on a Separate System................................................. 10                                  |
| 2.3 | Comparison of Different Installation Options ............................................................................... 10                     | Comparison of Different Installation Options ............................................................................... 10                     |
| 2.4 | Compatibility RegardingSP Levels................................................................................................11                  | Compatibility RegardingSP Levels................................................................................................11                  |
|     | 2.4.1                                                                                                                                               | DMIS Add-on...................................................................................................................11                    |
|     | 2.4.2                                                                                                                                               | ODP Framework..............................................................................................................11                       |
|   3 | Source System Installation........................................................................................................ 12               | Source System Installation........................................................................................................ 12               |
| 3.1 | Preparatory Steps for Source System...........................................................................................12                    | Preparatory Steps for Source System...........................................................................................12                    |
| 3.2 | Installation Steps for Source System.............................................................................................12                 | Installation Steps for Source System.............................................................................................12                 |
|   4 | ODP/SLT Installation .................................................................................................................14            | ODP/SLT Installation .................................................................................................................14            |
| 4.1 | Preparatory Steps for SAP LT Replication Server System........................................................... 14                                | Preparatory Steps for SAP LT Replication Server System........................................................... 14                                |
| 4.2 | Installation Steps for SAPLT Replication Server System .............................................................15                              | Installation Steps for SAPLT Replication Server System .............................................................15                              |
|   5 | Post Installation Activities.........................................................................................................16             | Post Installation Activities.........................................................................................................16             |
| 5.1 | User Creation and Connections .................................................................................................... 16               | User Creation and Connections .................................................................................................... 16               |
|     | 5.1.1                                                                                                                                               | User Creation and Connections for SAP Source System andODP/SLT System ........ 16                                                                   |
|     | 5.1.2                                                                                                                                               | User Creation for SAP LT Replication Server System................................................... 18                                            |
| 5.2 | Separate Tablespace for Logging Tables...................................................................................... 18                     | Separate Tablespace for Logging Tables...................................................................................... 18                     |

## 1 Getting Started

## 1.1 About this Document

## Purpose

This guide details the installation and configuration of the SAP Landscape Transformation Replication Server in order to facilitate real-time data replication for the Operational Data Provisioning framework.

This guide is intended for system administrators and consultants performing and initial install and configuration of SAP LT Replication Server. Proficiency with SAP NetWeaver Basis is required to complete the installation.

This guide will take you through the required steps to:

- Decide on a suitable installation type based on the existing system landscape
- Install the SAP LT Replication Server
- Configure the source data system for RFC access from the SAP LT Replication Server
- Configure  the SAP LT Replication Server as your target system
- Connect a subscriber system to the operational Delta Queue in the SAP LT Replication Server system
- Start replication of DataSources from the subscriber system

## 1.2 Related Information

## 1.2.1 Related Documentation and Guides for Operational Data Provisioning

For more information about the Operational Data Provisioning framework as part of SAP NetWeaver, see the resources listed in the table below.

| Topic                         | Guide/Tool                                                                                                                                                                     | Quick Link   |
|-------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| Operational Data Provisioning | SAP Help Portal (http://help.sap.com/) → Technology Platform → SAP NetWeaver → SAP NetWeaver Platform → SAP NetWeaver 7.4 → Application Help → Function-Oriented View → Search | See here.    |

| Topic                                                                  | Guide/Tool                                                                                                                                                                                                                                                                                                                                                           | Quick Link   |
|------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
|                                                                        | and Operational Analytics → Operational Data Provisioning                                                                                                                                                                                                                                                                                                            |              |
| Transferring Data with SAP Landscape Transformation Replication Server | SAP Help Portal (http://help.sap.com/) → Technology Platform → SAP NetWeaver → SAP NetWeaver Platform → SAP NetWeaver 7.4 → Application Help → Function-Oriented View → SAP Business Warehouse → Data Warehousing → Modeling → Data Acquisition Layer → Data Provision Using Source Systems → Transferring Data with SAP Landscape Transformation Replication Server | See here.    |

## 1.2.2 SAP LT Replication Server Guides

For the latest SAP Landscape Transformation Replication Server guides (for example Security, Installation, Sizing and others), see http://help.sap.com/sapslt.

## 1.3 Important SAP Notes

You must read the following SAP Notes before you start the installation. These SAP Notes contain the most recent information on the installation, as well as corrections to the installation documentation.

Make sure that you have the up-to-date version of each SAP Note, which you can find on SAP Support Portal  at http://support.sap.com/notes.

|   SAPNote Number | Title                                                                           | Description                                                                                               |
|------------------|---------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------|
|          2120574 | Operational Data Provisioning with SAP LT Replication Server                    | This SAP Note describes the ODP scenario with SAPLT Replication Server and provides installation details. |
|          2675613 | SLT (DMIS 2010 / 2011 / 2018) Installation, Corrections and Release Information | Information about the installation process.                                                               |
|          2874697 | Release Information SLT - DMIS 2018 SP03                                        | This SAP Note describes the installation or upgrade of SAP LT Replication Server to the relevant DMIS SP. |
|          2669326 | Installation and delta upgrade of DMIS_2018                                     | This SAP Note provides information about installing the add-on, and performing a delta upgrade            |

<!-- image -->

|   SAPNote Number | Title                                 | Description                                                     |
|------------------|---------------------------------------|-----------------------------------------------------------------|
|          1931427 | Operational Data Provisioning API 2.0 | Collective Note with Corrections for ODP API 2.0                |
|            19466 | Downloading SAPKernel patches         | Downloading a kernel patch in the Software Distribution Center. |

## 2 Planning

## 2.1 Introduction

SAP Operational Data Provisioning (ODP) is a solution which is integrated with SAP NetWeaver (release 7.30 onwards). It is a framework that allows for storing data in a queue, the Operational Delta Queue (ODQ) and makes the data available to SAP applications for extraction and replication by means of the ODP API. Data can be delivered to the queue with processes or extractors; the queue is a staging area where the data is stored, and the SAP applications subscribe to the API and consume the data from the queue. The ODP is capable of replicating delta data, and now in combination with SAP LT Replication Server ODP is also capable of replicating data in realtime. It is also possible to replicate pool and cluster tables, as well as data and views from non-ABAP source systems.

## Minimum SAP NetWeaver Requirements:

This ODP scenario is available with the following SAP NetWeaver releases:

- NW7.30 SP10 or with SP8 (together with SAP Note 1848320)
- NW7.31 SP8 or SP3 (together with SAP Note 1817467)
- NW7.40 SP4 or RTC (together with SAP Note 1817467)

## Current Restrictions:

- No replacement for complex extractors with delta logic

The following components are used in the technical system landscape:

- SAP source system

The source system tracks database changes by using database triggers. It records information about changes in the logging tables. Read modules (located on the SAP source system) transfer the data from the source system to the SAP LT Replication Server. The relevant data is read from the application tables.

- ·
- SAP LT Replication Server System

An SAP system that facilitates the replication of data from one or more source systems

- Target System

For the ODP scenario, the SAP LT Replication Server system acts as the target system, storing all replicated data in the Operational Delta Queue-of the Operational Data Provisioning Framework.

- Subscriber

A subscriber is an SAP application (currently SAP BW or SAP Business Objects Data Services), that connects to the API of the Operational Data Provisioning Framework of the SAP LT Replication Server system in order to consume data.

We recommend that the SAP LT Replication Server is installed on a separate system, but before you begin the installation, it is important to understand the various system landscape options available.

The SAP LT Replication Server can be installed either:

- On the source system
- On an SAP Solution Manager system or on a separate system
- On an SAP BW system.

The SAP LT Replication Server uses background processing to replicate data. This can be an important factor in deciding where to install SAP LT Replication Server since background processing uses CPU cycles. If the SAP LT Replication Server is a separate system, this ensures that the background processes do not run on the source system.  This option separates the software maintenance activities (kernel upgrades/patch management and so on) from the source system.

<!-- image -->

- The SAP LT Replication Server system must be a Unicode system
- Ensure that database performance is good. Poor database performance can result in poor SAP LT Replication Server performance.

## 2.2 Installation of SAP LT Replication Server on a Separate System

We recommend that the SAP LT Replication Server is installed on a separate system as illustrated below:

<!-- image -->

Typical system landscape.

<!-- image -->

Note

Ensure that the Basis release of the SLT system is of the same release (or higher) as the Basis release of any connected SAP system. This ensures that data types can be handled correctly.

## 2.3 Comparison of Different Installation Options

The following table outlines in detail the advantages and disadvantages of the different installation options:

|               | Separate System                                                      | BWSystem                                                                  | Source System (if SAP)                                                          |
|---------------|----------------------------------------------------------------------|---------------------------------------------------------------------------|---------------------------------------------------------------------------------|
| Advantages    | • No software maintenance dependencies • Flexibility                 | • Simplified landscape and administration • Re-use of existing NWinstance | • Simplified landscape and administration • Re-use of existing SAP ERP instance |
| Disadvantages | • Investment and maintenance effort for separate server / NWinstance | • Performance impact • Potential software maintenance dependencies        | • Performance impact • Potential software maintenance dependencies              |

Server

## 2.4 Compatibility Regarding SP Levels

## 2.4.1 DMIS Add-on

The table below outlines the compatibility between the different SP levels of the source system, the SAP LT Replication Server, and the subscriber application.

| Source System   | SAP LTReplication Server   |
|-----------------|----------------------------|
| DMIS 2010 SP10  | DMIS 2018 SP03             |

<!-- image -->

Note

The DMIS add-on does not need to be installed in the system on which the subscriber application runs.

## 2.4.2 ODP Framework

The ODP framework is part of the SAP NetWeaver PI\_BASIS component. To use the ODP scenario for real-time replication, the ODP framework is needed in the ODP/SLT system and the subscriber systems .

You can use any of the following PI\_BASIS releases:

- 730 SP10 or SP8 (together with SAP Note 1848320)
- 731 SP9 or SP5 (together with SAP Note 1848320)
- 740 SP4 (or higher) or SP2 (together with SAP Note 1848320)

The ODQ component which is needed in the ODP/SLT systems is part of SAP\_BASIS component.

You can use any of the following SAP\_BASIS releases:

- 730 SP10 or SP5 (together with SAP Note 1817467)
- 731 SP8 or SP3 (together with SAP Note 1817467)
- 740 SP4 (or higher) or RTC (together with SAP Note 1817467)

## 3 Source System Installation

## 3.1 Preparatory Steps for Source System

## Overview

Use this section to check that the source system is suitable for the replication of data using SAP LT Replication Server. Note that the SAP LT Replication Server is shipped in a specific add-on (DMIS\_2018*, DMIS\_2011* or DMIS\_2010*).

If you intend to run SAP LT Replication Server on your source system, the details outlined in section 4.1, Preparatory Steps for SAP LT Replication Server System also apply. Note that you can use more than one source system to replicate data to SAP BW (or any other subscriber) by using the ODP framework.

## Overview of Required Components

- The DMIS Add-on, DMIS\_2018.

## System Requirements

The following conditions apply for the source system:

- The system must be of at least SAP Basis release SAP NetWeaver 6.20.

To check whether your system is suitable for the installation of the DMIS add-on, DMIS\_2018, proceed as follows:

1. Determine the SAP Basis version of your source system (choose System → Status, and choose the Other Kernel Info pushbutton)
2. SAP Note 2675613 contain information about the installation and upgrade to DMIS 2018. Refer to this SAP Note in order to determine whether your SAP Basis and support package versions are supported.

## 3.2 Installation Steps for Source System

Use this section to install the required DMIS component in your source system.

## Note

If you plan to run the SAP LT Replication Server on the source system, you only have to follow the procedure that is described in chapter 4, SAP LT Replication Server Preparation and Installation.

All required software components are available from the SAP Support Portal https://support.sap.com/swdc and can be installed with the SAP Add-On Installation Tool (SAINT). For more information about SAINT, see here.

To install the DMIS Add-on (DMIS\_2018), proceed as follows:

1. Navigate to the SAP Support Portal, https://support.sap.com/swdc
2. 2.
3. Download the relevant DMIS version from the following path: Installations and Upgrades → A-Z Index → L → SAP LT Replication Server → SAP LT Replication Server 3.0
3. Follow the DMIS installation procedure as described in SAP Note 2675613. For information regarding the compatibility of the DMIS versions for the ODP scenario, see SAP Note 1914764.
4. Download latest available support packages from the following path: Support Packages and Patches → A-Z Index → L → SAP LT Replication Server → SAP LT Replication Server 3.0
5. Choose Entry by Component , and select the relevant product component version.

## 4 ODP/SLT Installation

## 4.1 Preparatory Steps for SAP LT Replication Server System

Use this section to check that the SAP LT Replication Server system is suitable for the replication of data using SAP LT Replication Server. Note that the SAP LT Replication Server is shipped in a specific add-on (DMIS\_2018*, DMIS\_2018).

<!-- image -->

Note

We recommend that the SAP LT Replication Server System is a separate system.

## Overview of Required Components

- The DMIS add-on, DMIS\_2018
- SAP NetWeaver 7.30 or higher with one of the following PI\_BASIS components:
- o 730 SP10 or SP8 (together with SAP Note 1848320)
- o 731 SP9 or SP5 (together with SAP Note 1848320)
- o 740 SP4 (or higher) or SP2 (together with SAP Note 1848320)

## System Requirements

The following requirements apply for the SAP LT Replication Server system:

- The system must be an SAP system with minimum SAP NetWeaver release of 7.30 (with at least Basis support package 8) ABAP stack

To check whether your system is suitable for the installation of the DMIS add-on, proceed as follows:

1. Determine the SAP Basis version of your SAP LT Replication Server system (choose System → Status , and choose the Other Kernel Info pushbutton)
2. SAP Note 2675613 contains information about the installation and upgrade to DMIS 2018.

## 4.2 Installation Steps for SAP LT Replication Server System

Use this section to install the required DMIS component in your SAP LT Replication Server system.

All required software components are available from the SAP Software Download Center https://support.sap.com/swdc and can be installed with the SAP Add-On Installation Tool (SAINT). For more information about SAINT, see here.

To install the DMIS add-on, DMIS\_2018, proceed as follows:

1. Navigate to the SAP Software Download Center, https://support.sap.com/swdc
2. Download the relevant DMIS version from the following path:
3. Installations and Upgrades → A-Z Index → L → SAP LT Replication Server → SAP LT Replication Server 3.0
3. Follow the DMIS installation procedure as described in SAP Note 2675613.
4. Download latest available support packages from the following path: Support Packages and Patches → A-Z Index → L → SAP LT Replication Server → SAP LT Replication Server 3.0
5. Choose Entry by Component , and select the relevant product component version.

## 5 Post Installation Activities

## 5.1 User Creation and Connections

The following figure illustrates the various users required in the source, subscriber, and SAP LT Replication Server systems. The following sections describe in detail exactly what is required.

<!-- image -->

## 5.1.1 User Creation and Connections for SAP Source System and ODP/SLT System

In order to replicate data using the SAP LT Replication Server, you must create an RFC connection to the source system and to the SLT system as the target system.

In order to do this, the following role is required:

- SAP\_IUUC\_REPL\_REMOTE

<!-- image -->

Note

If you use a new client after the DMIS add-on is applied, you must transport the necessary roles from client 000 into your target client.

<!-- image -->

Note

For more details about the roles and authorization concept of SAP LT Replication Server, see the Security Guide for SAP LT Replication Server.

## Prerequisites

Refer to the SAP user administration guide for RFC user creation.

## Generating Role SAP\_IUUC\_REPL\_REMOTE

To generate role SAP\_IUUC\_REPL\_REMOTE, proceed as follows:

1. Execute transaction PFCG .
2. In the role field, enter the role SAP\_IUUC\_REPL\_REMOTE .
3. Choose the Change Role pushbutton.
4. On the Authorizations tab page, choose the Change Authorization Data pushbutton.
5. The system displays the Change Role: Authorizations screen. Choose the Generate pushbutton.
6. Return to the Authorizations tab page; this tab page should now have a green light.
7. In the User tab page, choose the User Comparison pushbutton.
8. The system displays the Compare Role User Master Record screen. Choose the Complete Comparison pushbutton.
9. The User tab page should now also have a green light.

## Creating Users and RFC Connections

Create the required user and RFC connection as follows:

1. Create a user (of type Dialog or System ) in your source system and in the SAP LT Replication Server (target) system, generate and assign the following role to this user:
2. o SAP\_IUUC\_REPL\_REMOTE

Note

Do not use user DDIC. The role SAP\_IUUC\_REPL\_REMOTE is not generated by default. You must generate and assign this role to the newly created user.

2. Create an RFC connection (type 3 -ABAP) from the SAP LT Replication Server to the source system with the newly created user (if both systems are Unicode, specify the RFC connection as Unicode).
3. Create an RFC connection from the SAP LT Replication Server system that points to itself (the target system).
4. In the SAP LT Replication Server system, create a user with the role SAP\_IUUC\_REPL\_ADMIN\_BW\_ODQ. This user is needed later for the connection from the BW system to the ODQ (generate this role as explained for SAP\_IUUC\_REPL\_REMOTE).

## 5.1.2 User Creation for SAP LT Replication Server System

The SAP LT Replication Server is delivered with an own role SAP\_IUUC\_REPL\_ADMIN.  To activate the role, follow the procedure described in 6.2

For more details about the roles and authorization concept of SAP LT Replication Server, see the Security Guide for SAP LT Replication Server.

## 5.2 Separate Tablespace for Logging Tables

It is possible (but not essential) to store the source system replication log tables in a separate table space. The decision to do this is the responsibility of the system administrator. One advantage of having the log tables in their own table space is that you can easily monitor the size of the log tables.

As each database system has its own method of providing this functionality, refer to your database documentation for this procedure.

If you use own data classes and tablespaces, see SAP Note 46272.

SAP

## www.sap.com/contactsap

## Material Number

© 2020 SAP AG or an SAP affiliate company. All rights reserved. No part of this publication may be reproduced or transmitted in any form or for any purpose without the express permission of SAP AG. The information contained herein may be changed without prior notice.

Some software products marketed by SAP AG and its distributors contain proprietary software components of other software vendors.

National product specifications may vary.

These materials are provided by SAP AG and its affiliated

companies ('SAP Group') for informational purposes only, without representation or warranty of any kind, and SAP Group shall not be liable for errors or omissions with respect to the materials. The only warranties for SAP Group products and services are those that are set forth in the express warranty statements accompanying such products and services, if any. Nothing herein should be construed as constituting an additional warranty.

SAP and other SAP products and services mentioned herein as well as their respective logos are trademarks or registered trademarks of SAP AG in Germany and other countries. Please see

www.sap.com/corporate-en/legal/copyright/index.epx#trademark for additional trademark information and notices.