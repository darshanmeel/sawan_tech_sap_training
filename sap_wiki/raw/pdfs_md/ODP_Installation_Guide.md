## Installation Guide

SAP Landscape Transformation Replication Server Document Version: 2.1 -2017-08-23

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

|   Version | Date       | Change                                                                                                                         |
|-----------|------------|--------------------------------------------------------------------------------------------------------------------------------|
|       1.0 | 2013-09-12 | Initial Version                                                                                                                |
|       1.1 | 2013-09-24 | Updates to reflect SAP Landscape Transformation Replication Server DMIS_2011 support package 05                                |
|       1.2 | 2014-01-29 | Updates to reflect SAP Landscape Transformation Replication Server DMIS_2011 support package 06                                |
|       1.3 | 2014-07-08 | Updates to reflect SAP Landscape Transformation Replication Server DMIS_2011 support package 07                                |
|       1.4 | 2014-07-30 | Enhancements to section 5.2, User Creation and Connections and section 5.6, Data Replication Triggered from Subscriber System. |
|       1.5 | 2015-01-21 | Updates to reflect SAP Landscape Transformation Replication Server DMIS_2011 support package 08                                |
|       1.6 | 2015-07-28 | Updates to reflect SAP Landscape Transformation Replication Server DMIS_2011 support package 09                                |
|       1.7 | 2015-08-10 | Updated with additional information about SAP NetWeaver Business Client                                                        |
|       1.8 | 2015-12-28 | Updates to reflect SAP Landscape Transformation Replication Server DMIS_2011 support package 10                                |
|       1.9 | 2016-06-10 | Updates to reflect SAP Landscape Transformation Replication Server DMIS_2011 support package 11                                |
|       2.0 | 2017-01-16 | Updates to reflect SAP Landscape Transformation Replication Server DMIS_2011 support package 12                                |
|       2.1 | 2017-06-14 | Updates to reflect SAP Landscape Transformation Replication Server DMIS_2011 support package 13                                |
|       2.2 | 2017-07-23 | Update to include details of SAPNote 2520600, which is mandatory for DMIS 2011 SP13.                                           |

## Table of Contents

|   1 | Getting Started...............................................................................................................................................7     | Getting Started...............................................................................................................................................7     |    |
|-----|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|----|
| 1.1 | About this Document........................................................................................................................................7        | About this Document........................................................................................................................................7        |    |
| 1.2 | Related Information..........................................................................................................................................7      | Related Information..........................................................................................................................................7      |    |
|     | 1.2.1                                                                                                                                                               | Planning Information ........................................................................................................................7                      |    |
|     | 1.2.2                                                                                                                                                               | Further Useful Links..........................................................................................................................8                     |    |
|     | 1.2.3                                                                                                                                                               | Related Documentation and Guides for Operational Data Provisioning..........................................8                                                       |    |
|     | 1.2.4                                                                                                                                                               | RelatedSAP Landscape Transformation Replication Server Guides ..............................................9                                                       |    |
| 1.3 | Key Terms.........................................................................................................................................................9 | Key Terms.........................................................................................................................................................9 |    |
| 1.4 | Important SAPNotes ......................................................................................................................................11         | Important SAPNotes ......................................................................................................................................11         |    |
|   2 | Planning.........................................................................................................................................................12 | Planning.........................................................................................................................................................12 |    |
| 2.1 | Introduction....................................................................................................................................................    | Introduction....................................................................................................................................................    | 12 |
| 2.2 | Installation of SAP LT Replication Server on a Separate System..................................................................                                    | Installation of SAP LT Replication Server on a Separate System..................................................................                                    | 15 |
| 2.3 | Comparison of Different Installation Options ................................................................................................                       | Comparison of Different Installation Options ................................................................................................                       | 15 |
| 2.4 | Compatibility RegardingSP Levels................................................................................................................                    | Compatibility RegardingSP Levels................................................................................................................                    | 16 |
|     | 2.4.1                                                                                                                                                               | DMIS Add-on...................................................................................................................................                      | 16 |
|     | 2.4.2 ODP Framework..............................................................................................................................                   | 2.4.2 ODP Framework..............................................................................................................................                   | 16 |
|   3 | Source System Preparation and Installation ...........................................................................................18                            | Source System Preparation and Installation ...........................................................................................18                            |    |
| 3.1 | Preparatory Steps for Source System...........................................................................................................                      | Preparatory Steps for Source System...........................................................................................................                      | 18 |
| 3.2 | Installation Steps for Source System.............................................................................................................                   | Installation Steps for Source System.............................................................................................................                   | 19 |
|   4 | ODP/SLT System Preparation and Installation......................................................................................20                                 | ODP/SLT System Preparation and Installation......................................................................................20                                 |    |
| 4.1 | Preparatory Steps for SAP LT Replication Server System............................................................................20                                | Preparatory Steps for SAP LT Replication Server System............................................................................20                                |    |
| 4.2 | Installation Steps for SAPLT Replication Server System .............................................................................                                | Installation Steps for SAPLT Replication Server System .............................................................................                                | 21 |
|   5 | Post Installation Activities..........................................................................................................................22            | Post Installation Activities..........................................................................................................................22            |    |
| 5.1 | Activation of Web Dynpro and Relevant Services..........................................................................................22                          | Activation of Web Dynpro and Relevant Services..........................................................................................22                          |    |
| 5.2 | User Creation and Connections .....................................................................................................................23               | User Creation and Connections .....................................................................................................................23               |    |
|     | 5.2.1                                                                                                                                                               | User Creation and Connections for SAP Source System andODP/SLT System .........................23                                                                   |    |
|     | 5.2.2 User Creation for SAP LT Replication Server System....................................................................25                                      | 5.2.2 User Creation for SAP LT Replication Server System....................................................................25                                      |    |
| 5.3 | Separate Tablespace for Logging Tables.......................................................................................................25                     | Separate Tablespace for Logging Tables.......................................................................................................25                     |    |
| 5.4 | Creating a Configuration ................................................................................................................................25         | Creating a Configuration ................................................................................................................................25         |    |
| 5.5 | Data Replication Triggered from Subscriber System....................................................................................28                             | Data Replication Triggered from Subscriber System....................................................................................28                             |    |
| 5.6 | Advanced Replication Settings ......................................................................................................................29              | Advanced Replication Settings ......................................................................................................................29              |    |
| 5.7 | Accessing the Configuration and Monitoring Dashboard..............................................................................30                                | Accessing the Configuration and Monitoring Dashboard..............................................................................30                                |    |
| 5.8 | Monitoring of Data Transfer and the Operational Delta Queue.....................................................................30                                  | Monitoring of Data Transfer and the Operational Delta Queue.....................................................................30                                  |    |
|   6 | Resources for Operational Information ....................................................................................................32                        | Resources for Operational Information ....................................................................................................32                        |    |
| 6.1 | SAP Data Services..........................................................................................................................................32       | SAP Data Services..........................................................................................................................................32       |    |
| 6.2 | SAP BW...........................................................................................................................................................32 | SAP BW...........................................................................................................................................................32 |    |
|     | 6.3.1                                                                                                                                                               | Deleting a Subscription...................................................................................................................33                        |    |
|     | 6.3.2                                                                                                                                                               | Additional Information about Subscriptions ..................................................................................33                                     |    |

|   7 | References....................................................................................................................................................34   |
|-----|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 7.1 | List of Documents...........................................................................................................................................34     |
| 7.2 | List of SAP Notes............................................................................................................................................34    |
| 7.3 | SAP Help Portal Documentation....................................................................................................................35                |

## 1 Getting Started

## 1.1 About this Document

## Purpose

This guide details the installation and configuration of the SAP Landscape Transformation Replication Server in order to facilitate real-time data replication for the Operational Data Provisioning framework.

This guide is intended for system administrators and consultants performing and initial install and configuration of SAP LT Replication Server. Proficiency with SAP NetWeaver Basis is required to complete the installation.

This guide will take you through the required steps to:

-  Decide on a suitable installation type based on the existing system landscape
-  Install the SAP LT Replication Server
-  Configure the source data system for RFC access from the SAP LT Replication Server
-  Configure  the SAP LT Replication Server as your target system
-  Connect a subscriber system to the operational Delta Queue in the SAP LT Replication Server system
-  Start replication of DataSources from the subscriber system

## 1.2 Related Information

## 1.2.1 Planning Information

For more information about planning topics not covered in this guide, see the following content:

| Content                                                                                                          | Location                          |
|------------------------------------------------------------------------------------------------------------------|-----------------------------------|
| Latest versions of installation and upgrade guides                                                               | http://service.sap.com/instguides |
| Sizing, calculation of hardware requirements - such as CPU, disk and memory resource - with the Quick Sizer tool | http://service.sap.com/quicksizer |

| Content                                                                                               | Location                                                                                                               |
|-------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------|
| Released platforms and technology- related topics such as maintenance strategies and language support | http://service.sap.com/platforms To access the Platform Availability Matrix directly, enter http://support.sap.com/pam |
| Network security                                                                                      | http://service.sap.com/securityguide                                                                                   |
| High Availability                                                                                     | http://scn.sap.com/docs/DOC-7848                                                                                       |
| Performance                                                                                           | http://service.sap.com/performance                                                                                     |
| Information about Support Package Stacks, latest software versions and patch level requirements       | http://support.sap.com/sp-stacks                                                                                       |
| Information about Unicode technology                                                                  | http://scn.sap.com/community/internationalization- and-unicode                                                         |
| Content                                                                                               | Location                                                                                                               |

## 1.2.2 Further Useful Links

The following table lists further useful links:

| Content                                                                       | Location                        |
|-------------------------------------------------------------------------------|---------------------------------|
| Information about creating error messages                                     | http://support.sap.com/incident |
| SAP Notes search                                                              | http://support.sap.com/notes    |
| SAP Software Distribution Center (software download and ordering of software) | http://support.sap.com/swdc     |
| SAP Online Knowledge Products (OKPs) - role- specific LearningMaps            | http://service.sap.com/rkt      |

## 1.2.3 Related Documentation and Guides for Operational Data Provisioning

For more information about the Operational Data Provisioning framework as part of SAP NetWeaver, see the resources listed in the table below.

| Topic                                                                  | Guide/Tool                                                                                                                                                                                                                                                                                                                                                           | Quick Link   |
|------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| Operational Data Provisioning                                          | SAP Help Portal (http://help.sap.com/) → Technology Platform → SAP NetWeaver → SAP NetWeaver Platform → SAP NetWeaver 7.4 → Application Help → Function-Oriented View → Search and Operational Analytics → Operational Data Provisioning                                                                                                                             | See here.    |
| Transferring Data with SAP Landscape Transformation Replication Server | SAP Help Portal (http://help.sap.com/) → Technology Platform → SAP NetWeaver → SAP NetWeaver Platform → SAP NetWeaver 7.4 → Application Help → Function-Oriented View → SAP Business Warehouse → Data Warehousing → Modeling → Data Acquisition Layer → Data Provision Using Source Systems → Transferring Data with SAP Landscape Transformation Replication Server | See here.    |

## 1.2.4 Related SAP Landscape Transformation Replication Server Guides

For information about additional SAP LT Replication Server guides and resources, see SAP Note 1577441  (the central SAP Note for SAP LT replication server installation).

## 1.3 Key Terms

The following table contains key terms related to the SAP LT Replication Server:

| Term                                   | Definition                                                                                                                                                                                                                                                          |
|----------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Configuration                          | The definition of the parameters that the SAP LT Replication Server uses to replicate data from one or more source systems to one or more target systems. The configuration specifies the source system, the target system, and the relevant connections.           |
| Configuration and Monitoring Dashboard | An application that runs on the SAP LT Replication Server that you use to specify configuration information (such as the source and target systems, and relevant connections) so that data can be replicated. You can alsouse it to monitor the replication status. |
| Database trigger                       | A database trigger is procedural code that is automatically executed in response to certain events to a particular database table or view.                                                                                                                          |

| Term                                   | Definition                                                                                                                                                                                                                                                                                                                             |
|----------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Data transfer Job                      | A job that is used for the data transfer process in the SAPLT Replication Server.                                                                                                                                                                                                                                                      |
| Initial load                           | A step within the trigger-based replication process that loads data from the source system to target system.                                                                                                                                                                                                                           |
| Initial load Job                       | A job that is used for the initial load process in the SAP LT Replication Server.                                                                                                                                                                                                                                                      |
| Logging table                          | A table in the source system in which any changes to a table that is being replicated are recorded. This ensures that the SAP LT Replication Server can replicate these changes to the target system.                                                                                                                                  |
| Master job                             | A monitoring job that calls the initial load jobs and the data transfer jobs in the SAP LT Replication Server.                                                                                                                                                                                                                         |
| Reading type                           | A technique for reading data from tables in the target system during the initial load process.                                                                                                                                                                                                                                         |
| SAP LT Replication Server              | An SAPapplication that facilitates the replication of data from one or more source systems to one or more target systems. The source systems can be ABAP-based or non-ABAP-based systems.                                                                                                                                              |
| Trigger-based replication              | A technique for replicating data where an initial load is first performed that loads data from the source to the target system, and a replication phase begins whereby only changes to the source database (recorded by databases triggers) are replicated to the target database, thereby facilitating data replication in real-time. |
| DataSource                             | Object that makes data for a business unit available to SAP BW. A DataSource contains a number of logically-related fields that are arranged in a flat structure and contain data to be transferred into SAP BW.                                                                                                                       |
| Configuration                          | The definition of the parameters that the SAP LT Replication Server uses to replicate data from one or more source systems to one or more target systems. The configuration specifies the source system, the target system, and the relevant connections.                                                                              |
| Configuration and Monitoring Dashboard | An application that runs on the SAP LT Replication Server that you use to specify configuration information (such as the source and target systems, and relevant connections) so that data can be replicated. You can alsouse it to monitor the replication status.                                                                    |
| Subscriber                             | An SAPapplication (currently SAP BWor SAP Business Objects Data Services), that connects to the API of the Operational Data Provisioning Framework of the SAP LT Replication Server system in order to consume data.                                                                                                                   |

## 1.4 Important SAP Notes

You must read the following SAP Notes before you start the installation. These SAP Notes contain the most recent information on the installation, as well as corrections to the installation documentation.

Make sure that you have the up-to-date version of each SAP Note, which you can find on SAP Support Portal  at http://support.sap.com/notes.

|   SAPNote Number | Title                                                                                          | Description                                                                                                           |
|------------------|------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
|          2520600 | After upgrade to DMIS 2011 SP13: Tables automatically stop and vanish from ODQ- configurations | Mandatory SAP Note for SP13.                                                                                          |
|          2120574 | Operational Data Provisioning with SAP LT Replication Server                                   | This SAP Note describes the ODP scenario with SAPLT Replication Server and provides installation details.             |
|          1931427 | Operational Data Provisioning API 2.0                                                          | Collective Note with Corrections for ODP API 2.0                                                                      |
|            19466 | Downloading SAPKernel patches                                                                  | Downloading a kernel patch in the Software Distribution Center.                                                       |
|           517484 | Inactive services in the Internet Communication Framework                                      | The Internet Communication Framework Services are inactive when you install the SAP Web Application Server.           |
|          2446237 | Installation/Upgrade SLT - DMIS 2011 SP13                                                      | This SAP Note describes the installation or upgrade of SAP LT Replication Server to the relevant DMIS SP.             |
|          1817467 | Enable push of data units for Standard & DeltaInit requests                                    | This is a corrective note for ODQfunctionality which has to be implemented with DMIS2011 SP5 to use the ODP scenario. |

## 2 Planning

## 2.1 Introduction

## Important Information

If you are running SAP Landscape Transformation Replication Server on DMIS 2011 SP13 (or you have just upgraded to DMIS 2011 SP13), you must implement SAP Note 2520600 before using any configuration to replicate data.

SAP Operational Data Provisioning (ODP) is a solution which is integrated with SAP NetWeaver (release 7.30 onwards). It is a framework that allows for storing data in a queue, the Operational Delta Queue (ODQ) and makes the data available to SAP applications for extraction and replication by means of the ODP API. Data can be delivered to the queue with processes or extractors; the queue is a staging area where the data is stored, and the SAP applications subscribe to the API and consume the data from the queue. The ODP is capable of replicating delta data, and now in combination with SAP LT Replication Server ODP is also capable of replicating data in realtime. It is also possible to replicate pool and cluster tables, as well as data and views from non-ABAP source systems.

## Minimum SAP NetWeaver Requirements:

This ODP scenario is available with the following SAP NetWeaver releases:

-  NW7.30 SP10 or with SP8 (together with SAP Note 1848320)
-  NW7.31 SP8 or SP3 (together with SAP Note 1817467)
-  NW7.40 SP4 or RTC (together with SAP Note 1717467)

## Current Restrictions:

-  No replacement for complex extractors with delta logic

The following components are used in the technical system landscape:

-  SAP source system

The source system tracks database changes by using database triggers. It records information about changes in the logging tables. Read modules (located on the SAP source system) transfer the data from the source system to the SAP LT Replication Server. The relevant data is read from the application tables.

Server

-  SAP LT Replication Server System

An SAP system that facilitates the replication of data from one or more source systems

-  Target System

For the ODP scenario, the SAP LT Replication Server system acts as the target system, storing all replicated data in the Operational Delta Queue-of the Operational Data Provisioning Framework.

-  Subscriber

A subscriber is an SAP application (currently SAP BW or SAP Business Objects Data Services), that connects to the API of the Operational Data Provisioning Framework of the SAP LT Replication Server system in order to consume data.

We recommend that the SAP LT Replication Server is installed on a separate system, but before you begin the installation, it is important to understand the various system landscape options available.

The SAP LT Replication Server can be installed either:

-  On the source system
-  On an SAP Solution Manager system or on a separate system
-  On an SAP BW system.

The SAP LT Replication Server uses background processing to replicate data. This can be an important factor in deciding where to install SAP LT Replication Server since background processing uses CPU cycles. If the SAP LT Replication Server is a separate system, this ensures that the background processes do not run on the source system.  This option separates the software maintenance activities (kernel upgrades/patch management and so on) from the source system.

<!-- image -->

## Note

-  The SAP LT Replication Server system must be a Unicode system
-  Ensure that database performance is good. Poor database performance can result in poor SAP LT Replication Server performance.

Operational Data Provisioning in Real-time with SAP Landscape Transformation Replication

Server

## 2.2 Installation of SAP LT Replication Server on a Separate System

We recommend that the SAP LT Replication Server is installed on a separate system as illustrated below:

Typical system landscape.

<!-- image -->

## 2.3 Comparison of Different Installation Options

The following table outlines in detail the advantages and disadvantages of the different installation options:

|            | Separate System                                      | BWSystem                                                                  | Source System (if SAP)                                                          |
|------------|------------------------------------------------------|---------------------------------------------------------------------------|---------------------------------------------------------------------------------|
| Advantages |  No software maintenance dependencies  Flexibility |  Simplified landscape and administration  Re-use of existingNW instance |  Simplified landscape and administration  Re-use of existing SAP ERP instance |

|               | Separate System                                                      | BWSystem                                                           | Source System (if SAP)                                             |
|---------------|----------------------------------------------------------------------|--------------------------------------------------------------------|--------------------------------------------------------------------|
| Disadvantages |  Investment and maintenance effort for separate server / NWinstance |  Performance impact  Potential software maintenance dependencies |  Performance impact  Potential software maintenance dependencies |

## 2.4 Compatibility Regarding SP Levels

## 2.4.1 DMIS Add-on

The table below outlines the compatibility between the different SP levels of the source system, the SAP LT Replication Server, and the subscriber application.

| Source System            | SAP LTReplication Server   | Subscribers                                                  |
|--------------------------|----------------------------|--------------------------------------------------------------|
| DMIS 2011 SP10 or higher | DMIS 2011 SP13             | SAP BW7.3 - BW7.50 (BW on HANA) SAP BO Data Services 4.2 SP1 |

<!-- image -->

Note

The DMIS add-on does not need to be installed in the system on which the subscriber application runs.

## 2.4.2 ODP Framework

The ODP framework is part of the SAP NetWeaver PI\_BASIS component. To use the ODP scenario for real-time replication, the ODP framework is needed in the ODP/SLT system and the subscriber systems .

You can use any of the following PI\_BASIS releases:

-  730 SP10 or SP8 (together with SAP Note 1848320)
-  731 SP9 or SP5 (together with SAP Note 1848320)
-  740 SP4 (or higher) or SP2 (together with SAP Note 1848320)

Server The ODQ component which is needed in the ODP/SLT systems is part of SAP\_BASIS component.

You can use any of the following SAP\_BASIS releases:

-  730 SP10 or SP5 (together with SAP Note 1817467)
-  731 SP8 or SP3 (together with SAP Note 1817467)
-  740 SP4 (or higher) or RTC (together with SAP Note 1817467)

## 3 Source System Preparation and Installation

## 3.1 Preparatory Steps for Source System

## Overview

Use this section to check that the source system is suitable for the replication of data using SAP LT Replication Server. Note that the SAP LT Replication Server is shipped in a specific add-on (DMIS\_2011* or DMIS\_2010*).

If you intend to run SAP LT Replication Server on your source system, the details outlined in section 4.1, Preparatory Steps for SAP LT Replication Server System also apply. Note that you can use more than one source system to replicate data to SAP BW by using the ODP framework.

## Overview of Required Components

-  The DMIS Add-on, DMIS\_2011 with a minimum support package 03 (we recommend using the latest available support package).

## System Requirements

The following conditions apply for the source system:

-  The system must be of at least SAP Basis release SAP NetWeaver 6.20.

To check whether your system is suitable for the installation of the DMIS add-on, DMIS\_2011, proceed as follows:

1. Determine the SAP Basis version of your source system (choose System → Status, and choose the Other Kernel Info pushbutton)
2. SAP Note 1577441 and SAP Note 1577503 contain information about the installation and upgrade to DMIS 2011. Refer to these SAP Notes in order to determine that your SAP Basis and support package versions are supported.

## 3.2 Installation Steps for Source System

Use this section to install the required DMIS component in your source system.

## Note

If you plan to run the SAP LT Replication Server on the source system, you only have to follow the procedure that is described in chapter 4, SAP LT Replication Server Preparation and Installation.

All required software components are available from the SAP Support Portal https://support.sap.com/swdc and can be installed with the SAP Add-On Installation Tool (SAINT). For more information about SAINT, see here.

To install the DMIS Add-on (DMIS\_2011), proceed as follows:

1. Navigate to the SAP Support Portal, https://support.sap.com/swdc
2. 2.
3. Download the relevant DMIS version from the following path:

Installations and Upgrades → A-Z Index → L → SAP LT Replication Server → SAP LT Replication Server 2.0

3. Follow the DMIS installation procedure as described in SAP Note 1577441. For information regarding the compatibility of the DMIS versions for the ODP scenario, see SAP Note 1914764.
2. 4.

Support Packages and Patches → A-Z Index → L → SAP LT Replication Server → 2.0

- Download latest available support packages from the following path: SAP LT Replication Server
5. Choose Entry by Component , and select the relevant product component version.

## 4 ODP/SLT System Preparation and Installation

## 4.1 Preparatory Steps for SAP LT Replication Server System

Use this section to check that the SAP LT Replication Server system is suitable for the replication of data using SAP LT Replication Server. Note that the SAP LT Replication Server is shipped in a specific add-on (DMIS\_2011* or DMIS\_2010*).

<!-- image -->

Note

We recommend that the SAP LT Replication Server System is a separate system.

## Overview of Required Components

-  The DMIS add-on, DMIS\_2011, with a minimum support package 10 (we recommend using the latest available support package)
-  SAP NetWeaver 7.30 or higher with one of the following PI\_BASIS components:
- o 730 SP10 or SP8 (together with SAP Note 1848320)
- o 731 SP9 or SP5 (together with SAP Note 1848320)
- o 740 SP4 (or higher) or SP2 (together with SAP Note 1848320)

## System Requirements

The following requirements apply for the SAP LT Replication Server system:

-  The system must be an SAP system with minimum SAP NetWeaver release of 7.30 (with at least Basis support package 8) ABAP stack
- Note

<!-- image -->

-  File system: 100 GB

-  RAM: 16-32 GB

Server