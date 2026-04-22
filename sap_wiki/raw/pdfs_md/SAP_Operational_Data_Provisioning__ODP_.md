<!-- image -->

## Operational Data Provisioning (ODP) Update PUBLIC FAQ

Version:

1.0

<!-- image -->

## Table of Contents

1.

| 1.                                                                                                                                                                       | What changes are beingmadeto the Operational Data Provisioning (ODP) Remote Function Call API                                                                            |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| (ODP-RFC)?........................................................................................................................................................3      | (ODP-RFC)?........................................................................................................................................................3      |
| 2.                                                                                                                                                                       | Howdowedefine a third-party or non-SAP application in this context? ...................................................3                                                 |
| 3.                                                                                                                                                                       | What security concerns isSAP addressing with thisODP-RFC update? ...................................................3                                                    |
| 4.                                                                                                                                                                       | Which SAP systems use ODP-RFC?.........................................................................................................3                                 |
| 5.                                                                                                                                                                       | Does the ODP-RFC update change mycontractual entitlements?...........................................................3                                                   |
| 6.                                                                                                                                                                       | I rely on a third-party solution that usesODP-RFC to extract data to third-party application.What should                                                                 |
| I do?                                                                                                                                                                    | 3                                                                                                                                                                        |
| 7.                                                                                                                                                                       | What are the recommended alternatives to ODP-RFC? ...........................................................................3                                           |
| 8.                                                                                                                                                                       | HowcanI determine ifmy system is affected by the upcomingODP-RFC security patch?.......................3                                                                 |
| 9.                                                                                                                                                                       | Howwill I receive the self-assessment tool?............................................................................................3                                 |
| 10.                                                                                                                                                                      | Where can I find detailed instructions for installing, using the self-assessment tool and interpreting the                                                               |
| results? ..............................................................................................................................................................3 | results? ..............................................................................................................................................................3 |
| 11.                                                                                                                                                                      | Howwill I receive the security patch forODP-RFC? .................................................................................4                                      |
| 12.                                                                                                                                                                      | Is the ODP-RFC security patch part of the Support Packages?.................................................................4                                            |
| 13.                                                                                                                                                                      | Howdoesthe ODP-RFC security patch work? .........................................................................................4                                       |
| 14.                                                                                                                                                                      | Will the ODP-RFC security patch disruptmy current data replication workflows?....................................4                                                       |
| 15.                                                                                                                                                                      | What happens if I need more time after installing the Security Patch? .....................................................4                                             |
| 16.                                                                                                                                                                      | Where can I get help defining a recommended architecture?...................................................................4                                            |
| 17.                                                                                                                                                                      | What if myorganization isn't currently using ODP-RFC? ..........................................................................4                                        |

© 2026 SAP SE or an SAP affiliate company. All rights reserved. See Legal Notice on www.sap.com/legal-notice for use terms, disclaimers, disclosures, or restrictions related to this material.

## 1. What changes are being made to the Operational Data Provisioning (ODP) Remote Function Call API (ODP-RFC)?

SAP identified a security concern associated with certain ODP-RFC usage patterns and is implementing technical measures to ensure ODP-RFC is used only in supported and secure scenarios.

## 2. How do we define a third-party or non-SAP application in this context?

In this context, a 'third -party application' is any non-SAP solution, application, system or product that is using  ODPRFC for data extraction. Third-party applications include, but are not limited to, customer, partner, and third-party built solutions.

## 3. What security concerns is SAP addressing with this ODP-RFC update?

SAP identified a security concern related to unauthorized data access via ODP-RFC and has issued a security patch to address these risks by validating incoming calls against available subscriber types and blocking unpermitted ODPRFC calls.

## 4. Which SAP systems use ODP-RFC?

ODP-RFC can be used in all SAP ABAP-based applications that contain one of the relevant software components (PI\_BASIS, SAP\_BW or BW/4HANA) and run on-premise or in a private cloud setup. This includes SAP S/4HANA, SAP BW, SAP ECC and many other ABAP applications. ODP-RFC is not directly used in a public cloud setup as connectivity is established via http or other protocols and not based on RFC.

## 5. Does the ODP-RFC update change my contractual entitlements?

The  ODP-RFC  update  is  driven  by  security  and  supportability  considerations  and  does  not  change  license entitlements.

## 6. I rely on a third-party solution that uses ODP-RFC to extract data to third-party application. What should I do?

ODP-RFC use restrictions apply regardless of whether usage is direct or via a third-party application.

## 7. What are the recommended alternatives to ODP-RFC?

You may explore alternatives for transfer of data to third-party applications as described in the Documentation, some of which include:

- SAP Business Data Cloud (BDC)
- ODP OData API (ODP OData)
8. How can I determine if my system is affected by the upcoming ODP-RFC security patch?

SAP Note 3439624 provides a report that assesses completed calls to the ODP-RFC interface to identify unpermitted or suspicious calls. It is based on patterns used by permitted subscriber types and supports monitoring and analysis of data access by customers. You are required to complement the result of the report with manual investigation on unidentified or suspicious calls.

More information about the self-assessment tool can be found in SAP Note 3439624. The self-assessment should be conducted on all relevant source ABAP systems available in a customer landscape. Your are able to confirm whether the Note has been installed in the system or not via the SNOTE transaction.

## 9. How will I receive the self-assessment tool?

The self-assessment tool will be delivered with a new version of the SAP Note 3439624, available on April 13 th  2026.

## 10. Where can I find detailed instructions for installing, using the self-assessment tool and interpreting the results?

You should refer to SAP Note 3439624 .

© 2026 SAP SE or an SAP affiliate company. All rights reserved. See Legal Notice on www.sap.com/legal-notice for use terms, disclaimers, disclosures, or restrictions related to this material.

## 11. How will I receive the security patch for ODP-RFC?

The ODP-RFC security patch is scheduled for release on June 9 th  via SAP Security Note (link to be provided on June 9th), accessible through tools such as the SAP Support Portal or SAP Solution Manager.

## 12. Is the ODP-RFC security patch part of the Support Packages?

As part of SAP's maintenance strategy, this patch will be integrated into the subsequent support packages for the relevant components (PI\_BASIS, SAP BW/4HANA and SAP BW) following the June 9 th  patch day. Upon upgrade to the latest support package, the patch will be applied automatically, ensuring that you benefit from the accumulated security improvements.

## 13. How does the ODP-RFC security patch work?

The security patch verifies the caller of the ODP-RFC interface and abort calls from third party applications and is being release by SAP in response to an identified security concern related to unauthorized data access via ODP-RFC.

Please check the SAP Security Note (link to be provided on June 9th) .

## 14. Will the ODP-RFC security patch disrupt my current data replication workflows?

This patch will stop replication to third-party applications.

## 15. What happens if I need more time after installing the Security Patch?

SAP provides a time-limited option to revert to unrestricted ODP-RFC calls. This flexibility will expire on December 2026.  More details will be documented in the relevant SAP Notes, which will be published in June 2026.  Customers should be aware that the identified security risk will persist until the security patch has been installed, and the decision to temporarily revert to unrestricted ODPRFC calls is at the customer's risk.

## 16. Where can I get help defining a recommended architecture?

The SAP Customer Services &amp; Delivery team can support you in evaluating data access architectures.

## 17. What if my organization isn't currently using ODP-RFC?

Customers,  who  are  not  using  ODPRFC  should  continue  to  follow  SAP's  standard  security  and  maintenance recommendations for their systems.

## Appendix

## SAP Notes

- -SAP Informative Note -SAP Note 3255746
- -Self-Assessment Note -SAP Note 3439624
- -SAP Security Note -link to be provided on June 9th

<!-- image -->

PUBLIC

## Operational Data Provisioning (ODP) Technical FAQ Version 2.00 / April 2026

<!-- image -->

## Contents

| Overview of Operational Data Provisioning (ODP).............................................................. 3                         | Overview of Operational Data Provisioning (ODP).............................................................. 3                               |
|-----------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| 1.                                                                                                                                      | What is ODP?............................................................................................................................... 3 |
| Prerequisites for ODPusage..................................................................................................3           | Prerequisites for ODPusage..................................................................................................3                 |
| 2.                                                                                                                                      | What are the pre-requisites to use ODP for data transfer? ................................................... 3                               |
| Use cases for ODP...................................................................................................................4   | Use cases for ODP...................................................................................................................4         |
| 3.                                                                                                                                      | What are the major use cases for ODP?................................................................................... 4                    |
| ODPProvider Contexts...........................................................................................................5        | ODPProvider Contexts...........................................................................................................5              |
| ODPand Service-API DataSources (Extractors)............................................................................... 5            | ODPand Service-API DataSources (Extractors)............................................................................... 5                  |
| 4.                                                                                                                                      | How can I enable Extractors (DataSources) for ODP?............................................................ 5                              |
| 5.                                                                                                                                      | Can I use generic DataSources (Extractors) in SAP BW/4HANA?......................................... 5                                        |
| 6.                                                                                                                                      | What customer extension points (Exit, BADI) exist for ODP-SAPI?..................................... 5                                        |
| 7.                                                                                                                                      | What to consider about Extractors (DataSources) in S/4HANA On-Premise?.................... 5                                                  |
| ODP and SAP BWor SAP BW/4HANA Source Systems.................................................................. 5                        | ODP and SAP BWor SAP BW/4HANA Source Systems.................................................................. 5                              |
| 8.                                                                                                                                      | How do BW InfoProviders integrate with ODP?...................................................................... 5                           |
| ODP and ABAP CDS Views................................................................................................................. | ODP and ABAP CDS Views.................................................................................................................       |
| 9.                                                                                                                                      | How can we use ABAP CDS Views for delta extraction with ODP?...................................... 5                                          |
| ODPConsumers......................................................................................................................6     | ODPConsumers......................................................................................................................6           |
| SAP BW/4HANA AND SAPBWTARGET SYSTEMS (CONSUMER)................................................ 6                                       | SAP BW/4HANA AND SAPBWTARGET SYSTEMS (CONSUMER)................................................ 6                                             |
| 10.                                                                                                                                     | How do I connect an ABAP based SAP Source System to SAPBW or SAP BW/4HANA? 6                                                                  |
| ODP and SAP Data Services as a Consumer.................................................................................... 6           | ODP and SAP Data Services as a Consumer.................................................................................... 6                 |
| 11.                                                                                                                                     | Can SAP Data Services take advantage of the ODP framework?.......................................... 6                                        |
| ODP AND SAP HANA SMART DATA INTEGRATION (SDI ABAP ADAPTER) AS CONSUMER...6                                                              | ODP AND SAP HANA SMART DATA INTEGRATION (SDI ABAP ADAPTER) AS CONSUMER...6                                                                    |
| 12.                                                                                                                                     | Can SAP HANA Smart Data Integration (SDI) take advantage of the ODP framework? ..... 6                                                        |
| ODPPerformance and Operations........................................................................................7                  | ODPPerformance and Operations........................................................................................7                        |
| 13.                                                                                                                                     | How do I analyze the performance with delta extraction using ODP?.................................. 7                                         |
| 14.                                                                                                                                     | Do I have to consider ODQin my source system sizing? ...................................................... 7                                 |
| 15.                                                                                                                                     | How can I monitor the data exchange via the ODP framework?............................................ 7                                      |
| 16.                                                                                                                                     | Can I change the data in the ODQdirectly?............................................................................. 7                      |
| 17.                                                                                                                                     | Can 3rd party tools use the ODP data replication API?.......................................................... 7                             |

## Overview of Operational Data Provisioning (ODP)

## 1.  What is ODP?

Operational data provisioning supports extraction and replication scenarios for various SAP target applications and supports delta mechanisms in these scenarios. In case of a delta procedure, the data from a source (the so called ODP Provider) is automatically written to a delta queue using an update process or passed to the delta queue using an extractor interface. The SAP target applications (referred to as ODQ 'subscribers' or more generally 'ODP Consumers') retrieve the data from the delta queue and continue processing the data.

For more information, please see the following links:

- Transferring Data Using Operational Data Provisioning -SAP Help Portal for SAP BW/4HANA
- Transferring Data Using Operational Data Provisioning - SAP Help Portal for SAP NetWeaver 7.50
- ODP as Source System in SAP BW
- ODP as Source System in SAP BW/4HANA

## Prerequisites for ODP usage

## 2.  What are the pre-requisites to use ODP for data transfer?

See the following SAP Notes regarding the relevant software component versions to be available on a SAP ABAP Application that serves as source (ODP Provider):

- SAP\_BASIS &lt; 730 - SAP Note - 1521883 - ODP Replication API 1.0
- SAP\_BASIS &gt;= 730 - SAP Note 1931427 - ODP Replication API 2.0

For a functional comparison between ODP 1.0 and ODP 2.0 and further information on availability see SAP Note 2481315.

For a list of all available ODP provider types see the next question.

## Use cases for ODP

## 3.  What are the major use cases for ODP?

Here is an overview of ODP integration scenarios based on available ODP provider types (entity types in ABAP source application) and ODP consumer types (SAP targets using ODP data replication, aka as ODP subscriber types)

<!-- image -->

## ODP Provider Contexts

## ODP and Service-API DataSources (Extractors)

## 4.  How can I enable Extractors (DataSources) for ODP?

Please note that most Business Content DataSource (Extractors) can easily get released for Operational Data Provisioning. The same applies to generic (custom) DataSources. For more information, please see SAP Note 2232584 -Release of SAP Extractors for Operational Data Provisioning (ODP).

## 5.  Can I use generic DataSources (Extractors) in SAP BW/4HANA?

Consumption of generic DataSources created in SAP ABAP Systems in transaction RSO2 is possible using the ODP-SAPI provider type.

It is not possible to create generic DataSources in SAP BW/4HANA. Instead, in these cases please use custom ABAP CDS Views to expose data from your SAP BW/4HANA system to other systems (see 'ODP and ABAP CDS Views')

## 6.  What customer extension points (Exit, BADI) exist for ODP-SAPI?

Please refer to SAP Note 2684463.

7.  What to consider about Extractors (DataSources) in S/4HANA OnPremise?

Please refer to SAP Note 2500202.

## ODP and SAP BW or SAP BW/4HANA Source Systems

8.  How do BW InfoProviders integrate with ODP?

Please refer to Transferring Data from SAP BW or SAP BW/4HANA Systems via ODP (InfoProviders, Export DataSources) in the SAP Help Portal and section '2a) InfoProvider Data' of SAP Note 2481315.

## ODP and ABAP CDS Views

9.  How can we use ABAP CDS Views for delta extraction with ODP?

Please see SAP Learning - Loading Data Using ABAP CDS Views and Transferring Data from SAP Systems via ODP (ABAP CDS Views) in the SAP Help Portal.

## ODP Consumers

## SAP BW/4HANA AND SAP BW TARGET SYSTEMS (CONSUMER)

## 10.  How do I connect an ABAP based SAP Source System to SAP BW or SAP BW/4HANA?

For further information see SAP Note 2481315 - Operational Data Provisioning (ODP): Extracting from SAP Systems to SAP BW or SAP BW/4HANA -Availability and Limitations

Within SAP BW/4HANA, the 'SAP Source System', the 'BW Source System' and the 'MYSELF Source System' are no longer available.

- Connectivity to SAP Source Systems (Service API / Extractors) is now exclusively implemented using the ODP-SAP Source System type.
- Connectivity to BW Source Systems is now exclusively implemented using the ODP-BW Source System type.

## ODP and SAP Data Services as a Consumer

## 11. Can SAP Data Services take advantage of the ODP framework?

Extraction from ODP providers via the ODP-API is possible since SAP Data Services 4.2.  For further information please see the SAP Help Portal for SAP Data Services: Read, browse, and import SAP ODP sources.

## ODP AND SAP HANA SMART DATA INTEGRATION (SDI ABAP ADAPTER) AS CONSUMER

## 12.  Can SAP HANA Smart Data Integration (SDI) take advantage of the ODP framework?

Extraction from ODP providers via the ODP-API is possible with SAP HANA Smart Data Integration. For further information please see the Configuration Guide for the SAP ABAP Adapter in the SAP Help Portal.

## ODP Performance and Operations

## 13.  How do I analyze the performance with delta extraction using ODP?

If you experience performance issues with delta extraction of data on the basis of the Operational Delta Queue (ODQ) please review SAP Note 2300483 - ODQ fetch performance ODQDATA\_V.

## 14. Do I have to consider ODQ in my source system sizing?

ODP stores the data-to-be transferred in the source system within the ODQ. By default, the data is stored for a retention period of 24 hours (adjustable) after all subscribers received the data. For more information see the SAP Knowledge Base Article 2854627.

## 15. How can I monitor the data exchange via the ODP framework?

Please refer to Monitoring Delta Queues in the SAP Help Portal.

## 16. Can I change the data in the ODQ directly?

No, data in the Operational Delta Queue is not editable.

## 17. Can 3rd party tools use the ODP data replication API?

The ODP data replication API is restricted to SAP applications and not open to 3rd party ETL tools.

For more information see SAP Note 3255746.

<!-- image -->

PUBLIC

## Operational Data Provisioning (ODP) FAQ Version 1.01 / August 2017

<!-- image -->

## Contents

| Overview of Operational Data Provisioning (ODP)........................................................... 3                        | Overview of Operational Data Provisioning (ODP)........................................................... 3                                 |
|-------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| 1.                                                                                                                                  | What is ODP?...............................................................................................................................3 |
| 2.                                                                                                                                  | What are the advantages of the ODP Framework?..................................................................3                             |
| 3.                                                                                                                                  | Can you explain the difference between 'Service API', 'ODP' and 'Extractors'? ............. 3                                                |
| Prerequisites for ODP usage ............................................................................................... 4       | Prerequisites for ODP usage ............................................................................................... 4                |
| 4.                                                                                                                                  | What are the pre-requisites to use ODP for data transfer? ....................................................4                              |
| Use cases for ODP.................................................................................................................5 | Use cases for ODP.................................................................................................................5          |
| 5. What are the major use cases for ODP?...................................................................................5        | 5. What are the major use cases for ODP?...................................................................................5                 |
| ODP Provider Contexts.........................................................................................................6     | ODP Provider Contexts.........................................................................................................6              |
| 6.                                                                                                                                  | How can I enable Extractors (DataSources) for ODP?............................................................6                              |
| 7.                                                                                                                                  | Should we change to ODP based extraction with all existing extractors?...........................6                                           |
| 8.                                                                                                                                  | Does ODP have an impact on how the extractors work?.......................................................6                                  |
| 9.                                                                                                                                  | Can I use generic DataSources (Extractors) in SAP BW/4HANA?.........................................6                                        |
| 10.                                                                                                                                 | What to consider about Extractors (DataSources) when moving to S/4HANA?................7                                                     |
| 11.                                                                                                                                 | How do I expose BWInfoProviders from older releases to a SAP BW4/HANA System? 7                                                              |
| 12.                                                                                                                                 | How can we use ABAP CDS Views for delta extraction to SAPBW or SAP BW/4HANA? 7                                                               |
| 13.                                                                                                                                 | Does ODP work with SLT?.......................................................................................................7              |
| ODP Consumers....................................................................................................................8  | ODP Consumers....................................................................................................................8           |
| 14.                                                                                                                                 | How do I connect an ABAP based SAP Source System to SAP BWor SAP BW/4HANA? 8                                                                 |
| 15.                                                                                                                                 | Can SAP Data Services take advantage of the ODP framework?........................................9                                          |
| 16.                                                                                                                                 | Can SAP HANA Smart Data Integration (SDI) take advantage of the ODP framework?....9                                                          |
| ODP Performance and Operations......................................................................................9               | ODP Performance and Operations......................................................................................9                        |
| 17.                                                                                                                                 | Can ODP be deployed in parallel with the traditional delta queue approach?...................9                                               |
| 18.                                                                                                                                 | Is there a runtime advantage using ODP?..............................................................................9                       |
| 19.                                                                                                                                 | How do I analyze the performance with delta extraction using ODP?..............................10                                            |
| 20.                                                                                                                                 | Do I have to consider ODQin mysource system sizing? ..................................................10                                     |
| 21.                                                                                                                                 | How can I monitor the data exchange via the ODP framework?........................................10                                         |
| 22.                                                                                                                                 | Do I need a PSA for ODP based extraction? ........................................................................10                         |
| 23.                                                                                                                                 | Can I change the data in the ODQ directly? .........................................................................10                       |
| 24.                                                                                                                                 | Can 3rd party tools use the ODP data replication API?......................................................10                                |

3

## Overview of Operational Data Provisioning (ODP)

## 1.  What is ODP?

Operational Data Provisioning provides a technical infrastructure that you can use to support two different application scenarios. The first of these is Operational Analytics for decision making in operative business processes. The other is data extraction and replication.

Please note, this document primarily targets the 'Data Extraction and Replication' use case for Operational Data Provisioning (ODP). For further information regarding 'Operational Analytics' please refer to the Introduction to Operational Data Provisioning wiki page.

Operational data provisioning supports extraction and replication scenarios for various target applications and supports delta mechanisms in these scenarios. In case of a delta procedure, the data from a source (the so called ODP Provider) is automatically written to a delta queue using an update process or passed to the delta queue using an extractor interface. The target applications (referred to as ODQ 'subscribers' or more generally 'ODP Consumers') retrieve the data from the delta queue and continue processing the data.

Besides SAP BW/4HANA and SAP BW, Operational Data Provisioning can be used to provide data to other SAP Products such as SAP Data Services or SAP HANA Smart Data Integration.

For more information, please see the following links:

- ODP Documentation
- ODP as Source System in SAP BW
- ODP as Source System in SAP BW/4HANA

## 2.  What are the advantages of the ODP Framework?

- If you use ODP, you can load the data directly into the BW InfoProviders, bypassing the Persistent Staging Area (PSA) layer by using a Data Transfer Processes (DTP)
- The ODP infrastructure (with delta queues) takes over important services such as monitoring data requests.
- The data is stored in a compressed state in the delta queue. A delta request transfers data records from the queue to the subscriber (target system).
- The data changes to a queue can also be requested by more than one subscriber (target system)
- The data is retained in the delta queue for a specified time period for recovery purposes.

## 3.  Can you explain the difference between 'Service API', 'ODP' and 'Extractors'?

- The Service API (S-API) is the framework for DataSources (aka 'Extractors') in SAP ABAP applications. It allows the implementation, activation and enhancement of DataSources (Extractors).
- Operational Data Provisioning (ODP) is a framework in SAP ABAP applications for transferring data between systems. It allows to subscribe to (ODP Consumer) and publish various data providers (ODP Providers). From ODP Providers, data can be sent to different ODP Consumers (also several in parallel).
- The data of Service-API DataSources (Extractors) can get transferred to a target SAP BW or SAP BW/4HANA system through two different channels:

<!-- image -->

- The SAP Source System in SAP BW. This approach involves queueing of delta records in a Delta Queue (transaction RSA7) in the sending system.
- The ODP Source System in SAP BW (7.3 and higher) and SAP BW/4HANA. Therein, Service API DataSources (Extractors) are a specific (ODP Provider) context called 'ODP -SAPI'.
- For more information on other 'ODP Providers' and 'ODP Consumers' see the question 'What are major use cases for ODP' below.

<!-- image -->

## Prerequisites for ODP usage

## 4.  What are the pre-requisites to use ODP for data transfer?

## ODP Provider (Source System, e.g. SAP Business Suite, SLT, …)

- See the following notes regarding the correct support packages and SAP notes to be implemented on the respective SAP ABAP Application:
- SAP\_BASIS &lt; 730 - SAP Note - 1521883 - ODP Replication API 1.0
- SAP\_BASIS &gt;= 730 - SAP Note 1931427 - ODP Replication API 2.0
- For a functional comparison between ODP 1.0 and ODP 2.0, see SAP Note 2481315 -Operational Data Provisioning (ODP): Extracting from SAP Systems to SAP BW or SAP BW/4HANA -Availability and Limitations.
- For a list of all available ODP Providers see the next question.

## ODP Consumer (Target System, e.g. SAP BW or SAP BW/4HANA):

- Recommended starting release with BW 7.40 SP5 and supported for all databases.

- For creating and using ODP Source Systems in SAP BW 7.3x target systems, certain SAP Notes are required (please see SAP Note 1935357 -DTP With ODP Source System  and SAP Note 1780912 -Creating New ODP Source System is not Available)
- For a list of all available ODP Consumers see the next question.

## Use cases for ODP

## 5.  What are the major use cases for ODP?

Here is an overview of the most common ODP integration scenarios (less common scenarios are greyed out -the Operational Analytics use case is not a focus for this document):

<!-- image -->

*Not relevant in the context of this document

- a. ODP Provider ('Source System')
- Data transfer from SAP DataSources (Extractors)
- Data transfer from ABAP CDS Views
- Data transfer from SAP BW or SAP BW/4HANA systems
- Real-time replication of Tables and DB-Views from SAP Source System via SAP SLT
- Data transfer SAP HANA Information Views in SAP ABAP based Sources
- b.  ODP Consumer ('Target Systems')
- Data transfer to SAP BW or SAP BW/4HANA

- Data transfer to SAP DataServices
- Data transfer to the 'ABAP Adapter' in SAP HANA Smart Data Integration (SDI)

## ODP Provider Contexts

## ODP and Service-API DataSources (Extractors)

## 6.  How can I enable Extractors (DataSources) for ODP?

- Please note that most Business Content DataSource (Extractors) can easily get released for Operational Data Provisioning. The same applies to generic (custom) DataSources. For more information, please see SAP Note 2232584 -Release of SAP Extractors for Operational Data Provisioning (ODP).

## 7.  Should we change to ODP based extraction with all existing extractors?

- Since SAP BW &gt;= 7.4, ODP is the strategic relevant source system connection to SAP Sources. With SAP BW/4HANA, only the ODP source systems are available. The former SAP source system connection type has been deprecated.
- Hence, please consider ODP as the framework for all your implementations of new data flows into your SAP BW system for extraction from SAP Source Systems.

## 8.  Does ODP have an impact on how the extractors work?

- ODP doesn't change the implementation of application extractors, all the features and capabilities are the same.

## 9.  Can I use generic DataSources (Extractors) in SAP BW/4HANA?

- Consumption of generic DataSources created in SAP ABAP Systems in transaction RSO2 is possible in SAP BW/4HANA using the ODP-SAP source system connection type.
- It is however not possible to create generic DataSources or activate Technical Content DataSources on SAP BW/4HANA itself (SAP BW/4HANA serving as source to itself or other systems).
- Instead, in these cases please use custom ABAP CDS Views to expose tables or DB views from your SAP BW/4HANA system to other systems (see 'ODP and ABAP CDS Views')
- Technical Content DataSources will also be iteratively replaced by ABAP CDS Views (namespace RV*) for monitoring and extraction of SAP BW/4HANA statistics data. For more information see https://help.sap.com/viewer/107a6e8a38b74ede94c833ca3b7b6f51/1.0.4/enUS/1e596b288f494f5d815c86cf94c3fbbb.html

## 10.  What to consider about Extractors (DataSources) when moving to S/4HANA?

Many SAP Business Content DataSources (Extractors) will still work with S/4HANA. Please find more detailled information in SAP Note 2500202.

## ODP and SAP BW or SAP BW/4HANA Source Systems

## 11.  How do I expose BW InfoProviders from older releases to a SAP BW4/HANA System?

Since SAP BW 7.40 SP5 its been possible to extract data from SAP BW InfoProviders using the ODP-BW Provider Context. In prior SAP BW Releases, Export DataSources in the namespace 8* were used for extracting data out of SAP BW InfoProviders. Please see comment (4) in SAP Note 2481315 - Operational Data Provisioning (ODP): Extracting from SAP Systems to SAP BW or SAP BW/4HANA -Availability and Limitations, for further information to connect these Export DataSources via the ODP-BW Provider Context to a target SAP BW 7.50 or SAP BW/4HANA System.

Creation of Export DataSources (8*) within SAP BW/4HANA is not supported. Data Transfer out of InfoProviders in SAP BW/4HANA to other ODP Consumers / Target Systems (such as SAP BW) is only possible using the ODP-BW Context.

## Related Links:

- Exchanging Data Between BW Systems Using the ODP Source System
- SAP Note 2481315  - Operational Data Provisioning (ODP): Extracting from SAP Systems to SAP BW or SAP BW/4HANA -Availability and Limitations

In case you want to transfer data from Service API DataSources / Extractors out of a SAP BW or SAP BW/4HANA System (e.g. Technical Content or Generic (custom) DataSources) please refer to the ODPSAPI Provider Context (see chapter 'ODP and Service -API DataSources (Extractors') or the ODP -CDS Provider Context for SAP BW 7.50 and SAP BW/4HANA

## ODP and ABAP CDS Views

## 12.  How can we use ABAP CDS Views for delta extraction to SAP BW or SAP BW/4HANA?

- Please see How to use ABAP CDS for Data Provisioning in BW

## ODP and System Landscape Transformation (SLT)

## 13. Does ODP work with SLT?

Starting with SAP BW 7.40 we offer a flexible and scalable way for integrating SAP BW with SLT which is based on the Operational Data Provisioning Framework. For more information see SAP NetWeaver BW 7.40 -Real-Time Replication using  Operational Data Provisioning (ODP).

This document is also valid for SAP BW 7.50 and SAP BW/4HANA with the following differences:

- In SAP BW 7.40, Realtime Data Acquisition (RDA) daemons in SAP BW will be used for realtime loading of DTPs based on ODP-SLT to InfoCubes and classic DataStore Objects
- In SAP BW 7.50 and SAP BW/4HANA, Process Chains for Streaming will be used for realtime loading of DTPs based on ODP-SLT to Advanced DataStore Objects.
- For more information on Process Chains for Streaming see https://help.sap.com/viewer/2e90b26cf7484203a523bf0f4b1bc137/7.5.7/enUS/ac029de05e164a12ac1ce08d16180f05.html

There is also a system demonstration of Astrid Tschense-Oesterle available where you can see the above integration between SLT and ODP (based SAP BW 7.40) in a more detailed manner.

## ODP Consumers

## SAP BW/4HANA AND SAP BW TARGET SYSTEMS (CONSUMER)

## 14.  How do I connect an ABAP based SAP Source System to SAP BW or SAP BW/4HANA?

For further information see SAP Note 2481315 - Operational Data Provisioning (ODP): Extracting from SAP Systems to SAP BW or SAP BW/4HANA -Availability and Limitations

Within SAP BW/4HANA, the 'SAP Source System', the 'BW Source System' and the 'MYSELF Source System' are no longer available.

- Connectivity to SAP Source Systems (Service API / Extractors) is now exclusively implemented using the ODP-SAP Source System type.
- Connectivity to BW Source Systems is now exclusively implemented using the ODP-BW Source System type.

All ODP 1.0 or ODP 2.0 enabled SAP Source Systems can get connected to SAP BW/4HANA (see above 'ODP Provider'). Also with SAP BW/4HANA, the PSA Service has been deprecated completely and data is no longer persisted on DataSource level in PSA tables.

Conversion Support for existing SAP BW data flow scenarios using DataSources of SAP Source Systems or BW Source Systems is given with the SAP BW/4HANA Conversion Tools. Especialy the automatic conversion from SAP Source System based delta loads (using the RSA7 delta queue) to ODP Source System based delta loads (using the ODQ) is possible.

For more information see the following SAP Notes:

- SAP Note 2473145 - BW4SL - SAP and BW Source Systems
- SAP Note 2480284 - BW4SL - Hierarchy DataSources
- SAP Note 2464541 - BW4SL - Data Transfer Processes

…or find additional information in the complete SAP BW/4HANA Simplification List.

## ODP and SAP Data Services as a Consumer

## 15. Can SAP Data Services take advantage of the ODP framework?

Extraction from ODP providers via the so called ODP-API is possible with SAP Data Services 4.2 For further information please see the following information sources:

SAP Data Services 4.2 - Reading from SAP ODP sources

- https://help.sap.com/viewer/8092b085a68941f6aaa6708685a62b0d/4.2.7/enUS/57764b2e6d6d1014b3fc9283b0e91070.html

Steps required to connect SAP Data Services 4.2 to Extractors (DataSources) to extract from ABAP based SAP Applications

- https://answers.sap.com/questions/107365/steps-required-to-connect-bods-42-to-sap-ecc-to-us.html

New Feature of SAP Data Services 4.2 and 4.1

- https://blogs.sap.com/2015/08/03/new-feature-of-bods-42-and-bods-41/

## ODP AND SAP HANA SMART DATA INTEGRATION (SDI ABAP ADAPTER) AS CONSUMER

## 16.  Can SAP HANA Smart Data Integration (SDI) take advantage of the ODP framework?

Extraction from ODP providers via the ODP-API is also possible with SAP HANA SDI. For further information please see the following information source:

SAP ABAP Adapter in HANA SDI

- https://help.sap.com/viewer/7952ef28a6914997abc01745fef1b607/2.0\_SPS00/enUS/c911a7b06cf14c2999b78fe8ae2b96a8.html

## ODP Performance and Operations

## 17.  Can ODP be deployed in parallel with the traditional delta queue approach?

- Yes, it is possible, but it will multiply the data. ODP is a new source system for BW and would add the DataSource in a new context to the system

## 18. Is there a runtime advantage using ODP?

- ODP allows to skip the PSA layer and load directly with DTP from the source system into a target object in SAP BW or SAP BW/4HANA -lab results have shown a reduction in runtime by more than 40%
- Throughput of &gt; 35 million records per hour is achieved without tuning (3 times faster than parallel processing)