<!-- image -->

## PUBLIC

Document Version: 6.0 - 2026-01-28

## Operations Guide

for SAP S/4HANA and SAP S/4HANA Cloud Private Edition 2023

<!-- image -->

## Content

|    1 | Getting Started. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .         | . . 6   |
|------|----------------------------------------------------------------------------------------|---------|
|    2 | SAP S/4HANA System Landscape Information. . . . . . . .                                | . . .7  |
|    3 | Monitoring. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .      | . . 9   |
|  3.1 | Alert Monitoring with CCMS. . . . . . . . . . . . . . . . . . . . . . . .              | . . 9   |
|  3.2 | Trace and Log Files. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .       | . . 9   |
|    4 | Management of SAP S/4HANA. . . . . . . . . . . . . . . . . . . .                       | . .10   |
|  4.1 | Starting and Stopping. . . . . . . . . . . . . . . . . . . . . . . . . . . . .         | . 10    |
|  4.2 | Software Configuration. . . . . . . . . . . . . . . . . . . . . . . . . . . .          | . 10    |
|  4.3 | Output Management. . . . . . . . . . . . . . . . . . . . . . . . . . . . .             | . . 10  |
|  4.4 | Backup and Recovery. . . . . . . . . . . . . . . . . . . . . . . . . . . . .           | . 13    |
|  4.5 | Load Balancing. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .        | . . 13  |
|  4.6 | Data Archiving and Data Aging. . . . . . . . . . . . . . . . . . . . . . .             | . 13    |
|  4.7 | Set Up Clean Core Development Environment. . . . . . . . . . . .                       | . 14    |
|    5 | Business Continuity and High Availability. . . . . . . . . . . .                       | . .15   |
|    6 | User Management. . . . . . . . . . . . . . . . . . . . . . . . . . . . . .             | . .16   |
|    7 | Software Logistics and Change Management. . . . . . . . . .                            | . 17    |
|  7.1 | Change and Transport Management. . . . . . . . . . . . . . . . . . .                   | . 17    |
|  7.2 | Support Package and Patch Implementation. . . . . . . . . . . . .                      | . 17    |
|  7.3 | Release and Upgrade Management. . . . . . . . . . . . . . . . . . .                    | . .18   |
|    8 | Troubleshooting. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .         | . 19    |
|    9 | Support Desk Management. . . . . . . . . . . . . . . . . . . . . . .                   | . 20    |
|   10 | SAP S/4HANA Business Applications. . . . . . . . . . . . . . .                         | . . 21  |
| 10.1 | Finance. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .   | . 21    |
|      | Specific Monitoring Tools for Settlement Management. . .                               | . 21    |
|      | Monitoring of the SAP S/4HANA Financial Closing cockpit.                               | . .23   |
| 10.2 | Manufacturing. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .       | . 23    |
|      | Production Planning. . . . . . . . . . . . . . . . . . . . . . . . . . .               | . .23   |
|      | Project Manufacturing Management and Optimization. . .                                 | . 27    |
|      | Environment, Health, and Safety. . . . . . . . . . . . . . . . . . .                   | . 28    |
| 10.3 | Sales. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . | .45     |
|      | Order and Contract Management. . . . . . . . . . . . . . . . . .                       | . 45    |

|      | Solution Business Management. . . . . . . . . . . . . . . . . . . . . . . . . . . . . .                    | . 47   |
|------|------------------------------------------------------------------------------------------------------------|--------|
| 10.4 | Service. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . | . 48   |
|      | Service Operations and Processes. . . . . . . . . . . . . . . . . . . . . . . . . . . . .                  | .48    |
|      | Interaction Center. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .          | . 49   |
| 10.5 | Sourcing and Procurement. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .            | . 52   |
|      | Supplier Information and Master Data. . . . . . . . . . . . . . . . . . . . . . . . . .                    | . 53   |
|      | Specific Monitoring Information for Supplier Information and Master Data.                                  | . 53   |
|      | Scheduled Periodic Tasks. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .              | . 53   |
|      | Specific Troubleshooting for Supplier Information and Master Data. . . . .                                 | . 54   |
| 10.6 | Supply Chain. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .    | . 54   |
|      | Efficient Logistics and Order Fulfillment. . . . . . . . . . . . . . . . . . . . . . . . .                 | . 54   |
|      | Extended Warehouse Management. . . . . . . . . . . . . . . . . . . . . . . . . . . .                       | . 55   |
|      | Transportation Management. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .                 | .72    |
| 10.7 | R&D/Engineering. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .         | . 77   |
|      | Product Lifecycle Management. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .                  | . 77   |
|      | Enterprise Portfolio and Project Management. . . . . . . . . . . . . . . . . . . . .                       | .78    |
|      | Product Compliance. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .            | . 89   |
|      | Product Safety and Stewardship. . . . . . . . . . . . . . . . . . . . . . . . . . . . . .                  | . 94   |
| 10.8 | Cross Applications. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .      | .115   |
|      | Master Data Governance. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .                | . 115  |
|      | Enterprise Contract Management. . . . . . . . . . . . . . . . . . . . . . . . . . . . .                    | 119    |
| 10.9 | SAP S/4HANA Industries. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .          | .120   |
|      | Agriculture. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .       | 120    |
|      | Automotive. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .        | 124    |
|      | Insurance. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .       | 125    |
|      | Prepayment Agreements. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .                 | 142    |
|      | Public Services. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .         | .142   |
|   11 | Business Network Integration. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .              | .145   |
| 11.1 | Monitoring Business Network Integration: Overview. . . . . . . . . . . . . . . . . . .                     | 145    |
|      | Monitoring of cXML Messages. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .                 | . 145  |
|      | Application Log. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .         | 147    |
|      | Forward Error Handling. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .            | .148   |
|   12 | Central Procurement. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .           | . 151  |
| 12.1 | Monitoring and Error Handling in the Hub System. . . . . . . . . . . . . . . . . . . .                     | . 151  |
|      | Monitoring in the Hub System. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .                | 151    |
|      | Error Handling in the Hub System. . . . . . . . . . . . . . . . . . . . . . . . . . . . .                  | 154    |
| 12.2 | Monitoring and Error Handling in the SAP ERP System. . . . . . . . . . . . . . . . .                       | 155    |
|      | Monitoring in the SAP ERP System. . . . . . . . . . . . . . . . . . . . . . . . . . . .                    | .155   |
|      | Error Handling in the SAP ERP System. . . . . . . . . . . . . . . . . . . . . . . . . .                    | 157    |

Monitoring in the SAP S/4HANA System. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

159

Error Handling in the SAP S/4HANA System. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 162

## Document History

|   Version | Date              | Description                                                             |
|-----------|-------------------|-------------------------------------------------------------------------|
|       1.0 | October 11, 2023  | Version for SAP S/4HANA 2023.                                           |
|       2.0 | February 28, 2024 | Version for SAP S/4HANA 2023 FPS01.                                     |
|       3.0 | October 8, 2024   | Version for SAP S/4HANA 2023 FPS02.                                     |
|       3.1 | November 12, 2024 | Included section Set Up Clean Core De- velopment Environment [page 14]. |
|       4.0 | February 26, 2025 | Version for SAP S/4HANA 2023 FPS03.                                     |
|       5.0 | August 6, 2025    | Version for SAP S/4HANA 2023 SPS04.                                     |
|       6.0 | January 28, 2026  | Version for SAP S/4HANA 2023 SPS05.                                     |

## 1 Getting Started

##  Recommendation

This guide does not replace the daily operations handbook that we recommend you to create for your specific production operations.

## About This Guide

This guide provides a starting point for managing your SAP applications and maintaining and running them optimally. It contains specific information for various tasks and lists the tools that you can use to implement them. This guide also provides references to the documentation required for these tasks, so you will also need to refer to other documentation, especially to the documentation Administrating the ABAP Platform .

To access it, go to https:/ /help.sap.com/s4hana\_op\_2023, enter Administrating the ABAP Platform into the search bar, press Enter , and open the search result with that title.

##  Note

You always find the most up-to-date version of this guide at the SAP Help Portal under https:/ / help.sap.com/s4hana\_op\_2023.

##  Note

This guide includes information required to operate your SAP S/4HANA or SAP S/4HANA Cloud Private Edition system.

For SAP S/4HANA Cloud Private Edition, some of the tasks described in this guide are covered by services offered by SAP. The scope of these services is agreed as part of your subscription.

The first section of the guide contains generic information, valid for the entire on-premise edition of SAP S/ 4HANA. The sections under SAP S/4HANA Business Applications [page 21] contain information for specific functional areas.

## 2 SAP S/4HANA System Landscape Information

There are various ways of deploying SAP S/4HANA in your new or already existing system landscape. This section describes some examples.

## Example: SAP S/4HANA New Installation

A new installation of SAP S/4HANA needs to run on the SAP HANA database. It is recommended to use the SAP Solution Manager, which can run on any database. This very simple landscape can be enhanced with the SAP cloud solutions and SAP Business Suite products.

Simple SAP S/4HANA Deployment

<!-- image -->

## Example: SAP S/4HANA in an SAP Business Suite Landscape

It is possible to integrate SAP S/4HANA into an existing SAP Business Suite landscape by replacing the SAP ERP enhancement package product with SAP S/4HANA. When performing this conversion in your system landscape, you need to do some adaptations, for example you need to convert some of your existing business processes to the simplified SAP S/4HANA processes. Some of the SAP Business Suite processes are no longer supported, some have been changed, and there are also new processes. How to convert your existing processes to the SAP S/4HANA processes is described in the Simplification Item Catalog .

For more information about the Simplification Item Catalog , see the Conversion Guide for SAP S/4HANA at https:/ /help.sap.com/s4hana\_op\_2023 Implement Guides .

Example SAP Business Suite landscape with an embedded SAP S/4HANA system

<!-- image -->

## More Information

For more information about SAP Fiori for SAP S/4HANA see SAP Note 2590653 .

## 3 Monitoring

SAP provides you with an infrastructure to help your technical support consultants and system administrators effectively monitor your system landscape.

For more information about monitoring topics, go to https:/ /help.sap.com/s4hana\_op\_2023, enter Solution Monitoring into the search bar, press Enter , and open the search result with that title.

For more information about monitoring with SAP Solution Manager, go to https:/ /help.sap.com/ s4hana\_op\_2023, enter Connecting a Technical System to SAP Solution Manager into the search bar, press Enter , and open the search result with that title.

## 3.1 Alert Monitoring with CCMS

SAP S/4HANA uses the standard ABAP Platform monitoring tools, including the Computing Center Management System (CCMS). The tool allows you to monitor your system landscape centrally.

Alerts form a central element of monitoring. They quickly and reliably report errors (such as values exceeding or falling below a particular threshold value or that an IT component has been inactive for a defined period of time). These alerts are displayed in the Alert Monitor of the CCMS.

You can also monitor your data archiving activities with the monitoring functions provided by the CCMS.

For more information about CCMS, the Alert Monitor, and monitoring of data archiving, go to https:/ / help.sap.com/s4hana\_op\_2023, enter Monitoring in the CCMS into the search bar, press Enter , and open the search result with that title.

For more information about how to enable the auto-alert function of CCMS, see SAP Note 617547 .

For more information about data archiving, see Data Archiving and Data Aging [page 13].

## 3.2 Trace and Log Files

Trace and log files are essential for analyzing problems. SAP S/4HANA uses the standard ABAP Platform tools for tracing and logging.

For more information about this topic, go to https:/ /help.sap.com/s4hana\_op\_2023, enter Application Log (BC-SRV-BAL) into the search bar, press Enter , and open the search result with that title.

## 4 Management of SAP S/4HANA

SAP provides you with an infrastructure to help your technical support consultants and system administrators effectively manage all SAP components and complete all tasks related to technical administration and operation.

For more information about operational topics, go to https:/ /help.sap.com/s4hana\_op\_2023, enter Administrating the ABAP Platform into the search bar, press Enter , and open the search result with that title.

## 4.1 Starting and Stopping

You use the SAP Management Console to stop and start SAP systems based on ABAP Platform, including SAP S/4HANA.

For more information on the SAP Management Console, go to https:/ /help.sap.com/s4hana\_op\_2023, enter Starting and Stopping SAP Systems Based on SAP NetWeaver into the search bar, press Enter , and open the search result with that title.

## 4.2 Software Configuration

For information about how to do the configuration for SAP S/4HANA, see the guide Getting Started With SAP S/4HANA at the SAP Help Portal under https:/ /help.sap.com/s4hana\_op\_2023 Getting Started .

## 4.3 Output Management

SAP S/4HANA introduces a new style of output management. Note that other existing frameworks can be used as well, depending on the application.

You make settings for output control in Customizing under Cross-Application Components Output Control .

This is an overview of the required technical setup.

## Prerequisites for Output Control

- bgRFC configuration has been set up
- Storage system and category have been maintained

- BRFplus is active and usable
- Adobe Document Services is available (when using Adobe Forms)

## bgRFC (Background Remote Function Call)

Output control uses a bgRFC to process output. Therefore, you need to maintain the bgRFC configuration. Otherwise, no output can be performed.

You can perform all the relevant steps in transaction SBGRFCCONF . One of the most important steps is defining a supervisor destination, as bgRFC doesn't work without it.

For more information, enter the keyword bgRFC Configuration at http:/ /help.sap.com , and refer to SAP Note 2309399 and SAP Note 1616303 .

## Storage System and Category

Output control needs a defined storage system (content repository) to save the rendered form output as PDF.

To set up the storage system, choose the following navigation option:

SAP Menu

Transaction Code SPRO Cross-Application Components Document Management General Data Settings for Storage Systems Maintain Storage System

/nOAC0

You can set up the storage type which fits your needs, for example a SAP System Database, or a HTTP content server (such as fileserver, database, or external archive).

Once the storage system is available, you need to assign it to the predelivered storage category SOMU. To do so, choose the following navigation option:

SAP Menu

Transaction Code SPRO Cross-Application Components Document Management General Data Settings for Storage Systems Maintain Storage Category

/nOACT

Select category SOMU. For column Document Area , choose SOMU. For column Content Repository , choose the content repository you created in the previous step.

## Business Rule Framework plus (BRFplus)

Output control uses BRFplus for the output parameter determination. Technically, BRFplus is based on WebDynpro applications. Therefore, you need to set up the according ICF services:

| /sap/bc/webdynpro/sap/fdt_wd_workbench       | FDT Workbench       |
|----------------------------------------------|---------------------|
| /sap/bc/webdynpro/sap/fdt_wd_object_manager  | FDT Object Manager  |
| /sap/bc/webdynpro/sap/fdt_wd_catalog_browser | FDT Catalog Browser |

For more information, enter the keyword Active Services in SICF at http:/ /help.sap.com .

Once you've set up the services, download and install the required BRFplus applications from SAP Note 2248229 .

## Procedure:

1. Access transaction BRF+ . If required, personalize your screen, and change the user mode from Simple to Expert .
2. On the Business Rule Framework plus screen, choose Tools XML Import .
3. On the Business Rule Framework plus - XML Import screen, under File and Transport Request , browse for the local * .xml files you want to import. Y ou can import the files one after the other.
4. In the Customizing Request fi eld, enter an applicable Customizing Request ID.
5. Choose Upload XML File .
6. Choose Back to Workbench .

## Adobe Document Services (ADS)

Applications in SAP S/4HANA ship default form templates implemented as PDF-based print forms with fragments.

They require ADS for rendering. ADS is available as cloud solution or on-premise solution.

The cloud solution is a service provided on SAP Cloud Platform. See SAP Note 2219598 for more information and links to the documentation for the new solution Form Service by Adobe.

For the on-premise solution, you need an AS Java installation (with ADOBE usage type) to run ADS.

ADS itself must have version 10.4 (1040.xxx) or higher. This version is delivered with SAP NetWeaver 7.3 EHP1 SP7 (and higher), NW 7.40 SP2 (and higher), and NW 7.50 (all SPs).

You do not necessarily need to use ADS, as output management also supports SAPscript and Smart Forms.

However, special customizing is necessary for these two form technologies, and restrictions apply. For more information, see SAP Notes 2292539 and 2294198 .

## Printer Setup

Printing is done using the spool. For more information, see the SAP Printing Guide at https:/ /help.sap.com/ s4hana\_op\_2023 Use Product Assistance English Related Information: SAP S/4HANA and SAP S/ 4HANA Cloud Private Edition Enterprise Technology ABAP Platform Administrating the ABAP Platform Administration Concepts and Tools Solution Life Cycle Management .

Output control uses the short name of the printer (for example LP01 ), as defined in transaction SPAD .

## Limitations

- Printing using the spool is not available in release S4CORE 1.00 SP00. If this is the case, please upgrade to S4CORE 1.00 SP01.
- Currently, a PDF is always created for any kind of form. This has the following impact:
- Previewing the document from the spool request is only possible when the device type is PDF1 or PDFUC .
- Using another device type can lead to alignment issues for SAPscript and Smart Forms.
- Frontend output is not supported, since the output is processed via bgRFC.

## Related Information

[SAP Note 2228611](http://help.sap.com/disclaimer?site=https://me.sap.com/notes/2228611)

## 4.4 Backup and Recovery

You need to back up your system landscape regularly to ensure that you can restore and recover it in case of failure.

To use an appropriate back up and restore method is one of the most important tasks of the system and database administrator. However, there is no general recommendation for such a method, since it depends on several factors, such as:

- Disaster recovery concept
- Maximum permissible downtime during restore
- Amount of data loss that can be tolerated
- Available budget

For more information about backup and recovery, see:

- Go to https:/ /help.sap.com/s4hana\_op\_2023, enter Administrating the ABAP Platform into the search bar, press Enter , open the search result with that title, and navigate to Administration Concepts and Tools Solution Life Cycle Management Backup and Recovery .
- SAP HANA Technical Operations Manual at the SAP Help Portal under http:/ /help.sap.com/ hana\_platform System Administration

## 4.5 Load Balancing

SAP S/4HANA uses the standard ABAP Platform functions for load balancing.

For more information about this topic, go to https:/ /help.sap.com/s4hana\_op\_2023, enter Administrating the ABAP Platform into the search bar, press Enter , and open the search result with that title.

## 4.6 Data Archiving and Data Aging

## Data Archiving

You can use the data archiving functions to archive any completed business transactions that are no longer relevant for your daily operations, and so significantly reduce the load on the database. SAP S/4HANA uses the functions for archiving provided by ABAP Platform.

For more information about data archiving, go to https:/ /help.sap.com/s4hana\_op\_2023, enter Administrating the ABAP Platform into the search bar, press Enter , open the search result with that title, and navigate to Administration Concepts and Tools Solution Life Cycle Management .

For more information about monitoring of data archiving, see Alert Monitoring with CCMS [page 9].

## Data Aging

Data aging offers you the option of moving large amounts of data within a database so as to gain more working memory.

You use the relevant SAP application to move data from the current area to the historical area. You control the move by specifying a data temperature for the data. The move influences the visibility when data is accessed. This means that you can perform queries of large amounts of data in a much shorter time.

For more information about data aging (including the prerequisites for enabling it), go to https:/ /help.sap.com/ s4hana\_op\_2023, enter Administrating the ABAP Platform into the search bar, press Enter , open the search result with that title, and navigate to Administration Concepts and Tools Solution Life Cycle Management .

For more information about specific SAP S/4HANA data aging objects, see Efficient Logistics and Order

Fulfillment [page 54].

## 4.7 Set Up Clean Core Development Environment

The SAP S/4HANA ABAP Cloud development guidelines and clean core extensibility model enable you to reduce the amount of classic ABAP developments and enforce upgrade stability and clean core for your system. The ABAP Extensibility Guide https:/ /www.sap.com/documents/2022/10/52e0cd9b-497e-0010bca6-c68f7e60039b.html provides you with a blueprint for the ABAP Cloud and clean core extensibility model. The clean core extensibility model should be the default development environment for clean core in your system.

After you complete the step Change and Transport Management [page 17] to prepare the transport landscape, you need to set up your system for clean core development by creation of software components and development packages and the configuration of the ABAP Test Cockpit (ATC) check variant for governance of your clean core development as described in the SAP Help Portal at https:/ /help.sap.com/s4hana\_op\_2023 Use Product Assistance English Related Information: SAP S/4HANA and SAP S/4HANA Cloud Private Edition Enterprise Technology ABAP Platform Developing on the ABAP Platform Extensibility Developer Extensibility Set Up Developer Extensibility . The report SYCM\_3TIER\_SETUP\_SWC\_ATC can be used to automate the execution of this setup.

## 5 Business Continuity and High Availability

The term business continuity covers all activities performed by system administrators to ensure that critical business functions are available to system users. Strategies for high availability are a subset of business continuity activities, but business continuity is not limited to high availability. Other activities that relate to business continuity include:

- System backup and archiving
- System updates with minimum downtime

SAP S/4HANA uses the standard ABAP Platform functions for high availability and business continuity.

For more information about these topics, see:

- Go to https:/ /help.sap.com/s4hana\_op\_2023, enter Administrating the ABAP Platform into the search bar, press Enter , and open the search result with that title.
- SAP HANA Technical Operations Manual at the SAP Help Portal under http:/ /help.sap.com/ hana\_platform System Administration

## 6 User Management

SAP S/4HANA generally relies on the user management and authentication mechanisms provided with ABAP Platform, in particular the Application Server ABAP and the SAP HANA Platform. Therefore, the security recommendations and guidelines for user administration and authentication as described in the Application Server ABAP Security Guide and SAP HANA Platform documentation apply.

For more information, see:

- Go to https:/ /help.sap.com/s4hana\_op\_2023, enter Application Server ABAP Security Guide into the search bar, press Enter , and open the search result with that title.
- SAP HANA Security Guide at the SAP Help Portal under http:/ /help.sap.com/hana\_platform/ Implement Security

In addition to these guidelines, we include information about user administration and authentication that specifically applies to SAP S/4HANA in the Security Guide for SAP S/4HANA at the SAP Help Portal under https:/ /help.sap.com/s4hana\_op\_2023 Implement Guides .

## 7 Software Logistics and Change Management

The tools and processes in Software Logistics help you to manage the system landscape in all life cycle phases. Besides initial implementation of an application, the tools also support on-going system optimization and adaptation to evolving demands, as well as implementing additional functions.

##  Note

Some software logistics tools are delivered and regularly updated with the Software Logistics Toolset . For more information about these tools, see the documentation on the SAP Help Portal under http:/ / help.sap.com/sltoolset.

Software Change Management standardizes and automates the distribution of software in system landscapes.

For more information, go to https:/ /help.sap.com/s4hana\_op\_2023, enter Administrating the ABAP Platform into the search bar, press Enter , open the search result with that title, and navigate to Administration Concepts and Tools Solution Life Cycle Management Software Logistics .

## 7.1 Change and Transport Management

SAP S/4HANA uses the ABAP Platform tool Change and Transport System (CTS) to organize development projects in ABAP Workbench and customizing, and to then transport the changes between the SAP systems in your system landscape. In addition to ABAP objects, you can transport non-ABAP objects and non-SAP applications in your system landscape.

For more information about the CTS tool, go to https:/ /help.sap.com/s4hana\_op\_2023, enter Administrating the ABAP Platform into the search bar, press Enter , and open the search result with that title.

## 7.2 Support Package and Patch Implementation

We recommend that you implement Support Package Stacks (SP stacks), which are sets of support packages and patches for a specific product version that must be used in a specific combination.

You can find detailed information about the availability of SP-Stacks for SAP S/4HANA at the SAP Support Portal under support.sap.com/sp-stacks . Check the corresponding Release and Information Notes (RIN) before you apply any support packages or patches of the selected SP-Stack. The RIN for SAP S/4HANA 1610 is SAP Note 2346431 . See also the Support Package Levels for SAP S/4HANA in SAP Note 2236608 .

For more information about the implementation of support packages, see information on the SAP Support Portal under support.sap.com/patches SAP Support Packages .

For more information about the tools for implementing patches, go to https:/ /help.sap.com/s4hana\_op\_2023, enter Administrating the ABAP Platform into the search bar, press Enter , open the search result with that title, and navigate to Administration Concepts and Tools Solution Life Cycle Management Software Logistics .

##  Note

Support package stack (SPS) is equivalent to feature package stack (FPS). The term feature indicates that new features are delivered with the FPS, not just bug fixes as with support package stacks.

## 7.3 Release and Upgrade Management

Corrections for SAP S/4HANA are available in support packages.

## 8 Troubleshooting

For more information about troubleshooting for systems based on ABAP Platform, go to https:/ /help.sap.com/ s4hana\_op\_2023, enter Administrating the ABAP Platform into the search bar, press Enter , open the search result with that title, and navigate to Administration Concepts and Tools Solution Life Cycle Management .

## 9 Support Desk Management

You can set up problem resolution procedures tailored to your requirements. The procedure should integrate your business users, internal support personnel, partners and SAP support.

## Remote Support Setup

If you want to use SAP remote services (for example, SAP EarlyWatch or Remote Consulting), or if you would like to permit an SAP support consultant to work directly in your system to make a more precise problem diagnosis, then you need to set up a remote service connection.

For more information about setting up remote service connections to SAP, see:

- SAP Support Portal under support.sap.com/access-support
- Go to https:/ /help.sap.com/s4hana\_op\_2023, enter Setting Up Service Connections for SAP Remote Support into the search bar, press Enter , and open the search result with that title.

## Problem Message Handover

SAP S/4HANA uses the functions of the SAP Solution Manager to create internal support messages and to forward them to SAP.

For more information, see the SAP Help Portal under http:/ /help.sap.com/solutionmanager/ Use Application Help SAP Engagement and Service Delivery .

To send problem messages to SAP, use the relevant application component in the SAP application component hierarchy.

| Required for Scenario                                                          | Program Name/Task               | Task Scheduling Tool   | Recommended Frequency   | Detailed Description                                                                                                                                                   |
|--------------------------------------------------------------------------------|---------------------------------|------------------------|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| To delete plan data for employees who no longer have an active HRmaster record | /CPD/ PFP_EMP_DATA_CONS ISTENCY | Transaction SM36       | Monthly                 | You can use this report to delete plan data for an employee who no longer has an active HRmaster record. The report deletes plan data from the InfoCube / CPD/PFP_R01. |

## 10.7.2.2.3  Data Consistency

If related or identical data is stored in multiple places there may be the possibility of inconsistencies (for example, after a restore of a single component). The following table describes how consistency can be verified and how inconsistencies may be repaired.

| Component / Data Store            | Check Tool / Method                               | Detailed Description                                                                                                                                                                                                     | Prerequisites                      |
|-----------------------------------|---------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------|
| Project Cost and Revenue Planning | Transaction code: RSRT query /CPD/ PFP_MP01_Q0001 | This report shows the consistency of plan data and the Controlling posting data (if it had been changed) after the transfer to S4CORE. This report only shows the data consistency of work breakdown structure elements. | The transfer to S4CORE is complete |

## 10.7.2.2.4  Management of BW

The planning cube of Project Cost and Revenue Planning does not depend on data extraction from OLTP tables. It is a real-time cube into which data is directly written into and read from during planning activities. Using real-time data acquisition, new or changes to master data is constantly updated from source master data tables, into the InfoCube. Therefore, physical management of a data warehouse is not a mandatory activity. However, if you have a central BW installation and a local BW client for Commercial Project Management, then it is necessary to monitor both BW systems.