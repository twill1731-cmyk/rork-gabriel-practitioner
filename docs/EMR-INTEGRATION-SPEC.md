# Gabriel Practitioner App: EMR Integration Specification

## 1. EMR Platform Analysis

This section details the feasibility of integrating with various Electronic Medical Record (EMR) platforms popular in the naturopathic, integrative, and functional medicine spaces.

### 1.1. Jane App (janeapp.com)

*   **API Availability**: Jane App does not have a public API. Their official documentation states they have no plans to offer one.
*   **OAuth Support**: No public OAuth support.
*   **Accessible Patient Data**: Unknown due to the lack of a public API.
*   **Partnership/Approval Requirements**: Integration would likely require a direct partnership with Jane App.
*   **Pricing**: Unknown.
*   **Rate Limits**: Unknown.
*   **Notes**: Given Jane App's significant market share, a partnership should be a high priority. An alternative could be to investigate unofficial APIs or third-party integration services if they exist and are compliant.

### 1.2. Practice Better (practicebetter.io)

*   **API Availability**: Practice Better has an API, but the documentation is not publicly available. Access is granted after contacting their support or through a partner program.
*   **OAuth Support**: Unknown.
*   **Accessible Patient Data**: Likely includes client management, scheduling, and payment information, but specifics are not public.
*   **Partnership/Approval Requirements**: Requires contacting Practice Better and likely joining a developer/partner program.
*   **Pricing**: Unknown.
*   **Rate Limits**: Unknown.
*   **Notes**: A promising candidate due to its target market, but the lack of public documentation means the first step is to engage with Practice Better to get API access.

### 1.3. Cerbo (cerbo.io)

*   **API Availability**: Yes, Cerbo provides a REST API with documentation on a developer portal.
*   **OAuth Support**: Yes.
*   **Accessible Patient Data**: Patient management (create, search, update), appointments, clinical documentation, questionnaires, and tasks.
*   **Partnership/Approval Requirements**: Likely requires developer account creation.
*   **Pricing**: Unknown.
*   **Rate Limits**: Unknown.
*   **Notes**: Cerbo is a strong candidate for an early integration given its focus on the functional/integrative market and its available REST API.

### 1.4. SimplePractice (simplepractice.com)

*   **API Availability**: Limited API access, primarily available through their Enterprise plan. It is not an open API for general developer use.
*   **OAuth Support**: Unknown.
*   **Accessible Patient Data**: Scheduling, client records, intake documents, clinical documentation, and insurance billing.
*   **Partnership/Approval Requirements**: Requires an Enterprise plan subscription and likely a partnership agreement.
*   **Pricing**: Enterprise pricing is not public.
*   **Rate Limits**: Unknown.
*   **Notes**: The enterprise-focused API makes SimplePractice a less ideal candidate for an initial, broad-based integration strategy.

### 1.5. CharmHealth (charmhealth.com)

*   **API Availability**: Yes, CharmHealth offers HL7 FHIR-based APIs (Version 1.2).
*   **OAuth Support**: Yes, OAuth 2.0.
*   **Accessible Patient Data**: Extensive read access to patient resources, including demographics, conditions, diagnostic reports, medications, observations, and more.
*   **Partnership/Approval Requirements**: Requires registering for credentials by contacting CharmHealth support.
*   **Pricing**: Unknown.
*   **Rate Limits**: Unknown.
*   **Notes**: CharmHealth is a very strong candidate for integration due to its use of the FHIR standard, which will simplify data mapping and future integrations with other FHIR-compliant EMRs.

### 1.6. Power2Practice (power2practice.com)

*   **API Availability**: No public API documentation is available.
*   **OAuth Support**: Unknown.
*   **Accessible Patient Data**: Unknown.
*   **Partnership/Approval Requirements**: Would require direct contact with Power2Practice to inquire about partnership and API access.
*   **Pricing**: Unknown.
*   **Rate Limits**: Unknown.
*   **Notes**: Similar to Jane and Practice Better, the lack of a public API makes this a higher-effort integration that would require a formal partnership.

### 1.7. Health Gorilla (healthgorilla.com)

*   **API Availability**: Yes, Health Gorilla provides a comprehensive, FHIR-based API.
*   **OAuth Support**: Yes.
*   **Accessible Patient Data**: Clinical data exchange, lab orders, and more.
*   **Partnership/Approval Requirements**: Requires developer account and likely adherence to their terms of service for health data exchange.
*   **Pricing**: Unknown.
*   **Rate Limits**: Unknown.
*   **Notes**: Health Gorilla is a key potential partner, not as a primary EMR but as a data aggregator that could provide access to a wide range of patient data from multiple sources.

### 1.8. Canvas Medical (canvasmedical.com)

*   **API Availability**: Yes, Canvas Medical provides FHIR R4-compliant APIs, a Notes API, and a Server-Side SDK.
*   **OAuth Support**: Yes, OAuth 2.0.
*   **Accessible Patient Data**: Patient notes, FHIR resources (Patient, Appointment, DocumentReference, etc.). The SDK allows for custom data access.
*   **Partnership/Approval Requirements**: Requires obtaining client credentials from Canvas Medical.
*   **Pricing**: Unknown.
*   **Rate Limits**: Unknown.
*   **Notes**: Canvas Medical is a top-tier candidate for integration due to its modern, developer-friendly, and FHIR-based API. The SDK offers powerful customization options.

### 1.9. Other APIs

*   **Fullscript API**: Yes, Fullscript has an API. This is not an EMR but a supplement dispensary. Integration would allow Gabriel to access supplement recommendations and potentially make new ones.
*   **Rupa Health API**: Yes, Rupa Health has an API. This is a lab testing platform. Integration would allow Gabriel to access lab results directly.

## 2. Conversational Onboarding Flow

The onboarding process for a new practitioner will be handled entirely through a conversational interface, aiming for a setup time of under two minutes.

*   **Initial Prompt**: "Welcome to Gabriel. What EMR software do you use to manage your practice?"
*   **EMR Detection**: Gabriel will parse the practitioner's response to identify the EMR.
    *   **Known EMR with API**: If the EMR is one with a pre-built integration (e.g., Cerbo, CharmHealth), Gabriel will respond: "Great, I can connect to Cerbo. I'll just need you to authorize the connection." This will trigger an OAuth popup for the practitioner to log in and approve access.
    *   **Known EMR without API**: If the EMR is known but has no API (e.g., Jane App), Gabriel will respond: "We're working on a direct integration with Jane App. For now, you can import your patient data as a CSV file. Would you like instructions on how to do that?"
    *   **Unknown EMR**: If the EMR is not recognized, Gabriel will say: "I'm not familiar with that EMR yet. We can add it to our integration waitlist. In the meantime, you can import your patient data via CSV or add patients manually. What would you prefer?"
*   **Data Sync**: Once authorized, Gabriel will initiate the first data sync in the background and notify the practitioner: "Thanks! I'm now syncing your patient data from Cerbo. This may take a few minutes. I'll let you know when it's complete. In the meantime, you can start exploring Gabriel's features."

## 3. Per-Practitioner Context Architecture

Each practitioner will have a dedicated, isolated workspace to ensure data privacy and a personalized experience.

*   **Two Retrieval Paths**:
    *   **Structured Queries**: For questions with definitive answers like "What are the latest lab results for patient X?", Gabriel will query a structured database (e.g., a SQL database with a normalized schema). These queries will never be generative to prevent hallucinations.
    *   **Reasoning Queries**: For open-ended questions like "What should I consider for a patient with these symptoms and lab results?", Gabriel will use a Retrieval-Augmented Generation (RAG) model. The retrieval component will pull relevant information from the patient's records, and the generation component will synthesize an answer based on that data and Gabriel's general medical knowledge.
*   **Per-Practitioner Memory Layer**: Each workspace will include a `MEMORY.md`-like file that stores the practitioner's preferences, common treatment protocols, and practice style. This will allow Gabriel to tailor its responses and suggestions to the individual practitioner.
*   **Anti-Hallucination Guardrails**:
    *   **Source Citation**: All information provided by Gabriel will include a citation to the source document and the date of the information.
    *   **"I Don't Know"**: If Gabriel cannot find the requested information, it will respond with "I don't have that data in the patient's record" rather than guessing.
    *   **Confidence Scoring**: Generated answers will be accompanied by a confidence score to help the practitioner gauge the reliability of the information.
    *   **Audit Trail**: All queries and responses will be logged in a full audit trail for transparency and review.

## 4. Definitive Data Architecture

The data architecture is designed with a three-layer model to ensure security and privacy.

1.  **Data at Rest**: All patient data will be encrypted at rest. The encryption keys will be held by the practitioner, not by Gabriel, ensuring that only the practitioner can access their patient data.
2.  **Data in Use**: Data will only be decrypted in a secure compute environment during an active request. As soon as the request is complete, the decrypted data is wiped from memory.
3.  **Training**: Gabriel's models will only be trained on de-identified, aggregated data. Explicit consent will be required from practitioners to include their anonymized data in the training set. All training will be performed in a HIPAA-compliant environment.

## 5. Unified Data Schema

A unified data schema will be used to normalize data from various EMR sources.

*   **Patient Model**: A comprehensive patient model will include demographics, contact information, and a unique identifier.
*   **Protocol/Treatment Plan Model**: This model will capture the details of treatment plans, including prescribed supplements, dietary recommendations, and lifestyle changes.
*   **Lab Results Model**: A standardized model for lab results will include the test name, value, units, reference range, and date.
*   **Appointment Model**: This model will store information about patient appointments, including the date, time, practitioner, and encounter notes.

## 6. Competitive Landscape

Gabriel is positioned as an AI intelligence layer that sits on top of existing EMRs, not as a competitor to them.

*   **Direct Competitors**: There are currently no direct competitors offering an AI intelligence layer specifically for the naturopathic and integrative medicine market.
*   **Indirect Competitors**:
    *   **Tempus, Flatiron Health**: These companies are focused on oncology and pharma, a different market.
    *   **Practice Better, Jane, Cerbo**: These are EMRs that Gabriel will integrate with, not compete against.
    *   **Fullscript, Rupa Health**: These are complementary tools for supplement dispensing and lab testing that Gabriel will also integrate with.

## 7. Implementation Roadmap

The implementation will be phased to prioritize the most impactful integrations first.

*   **Phase 1**: Integrate with the EMR that offers the best combination of market share and API accessibility. Based on the research, **CharmHealth** or **Canvas Medical** are the strongest candidates for the first integration due to their FHIR-based APIs.
*   **Phase 2**: Integrate with 2-3 more EMRs, likely including **Cerbo** and beginning partnership discussions with **Practice Better** and **Jane App**.
*   **Phase 3**: Develop a FHIR adapter to more easily integrate with the long tail of FHIR-compliant EMRs.
*   **Phase 4**: Implement a zero-knowledge encryption model where the practitioner holds the encryption keys.

## 8. Infrastructure

The infrastructure will be designed for scalability and HIPAA compliance from day one.

*   **Auto-Provisioning**: On signup (triggered by a Stripe webhook), a new, isolated namespace will be created for the practitioner, and the EMR data sync will be initiated automatically.
*   **Cloud Hosting**: The platform will be hosted on a cloud provider that offers HIPAA-compliant services. Supabase with pgvector is recommended for Phase 1 to provide a scalable and secure database with vector search capabilities for the RAG model.
*   **HIPAA Compliance**: All aspects of the architecture and infrastructure will be designed to meet HIPAA requirements for handling protected health information (PHI).
