Ramakrishnan P H 24BCE5128
	
11:20 AM (12 minutes ago)
	
	
to me
Absolutely. I'd keep this as a pure product specification without mentioning UI decisions. The UI prompt and this prompt should stay completely independent.


---

System / Product Prompt

Build a production-ready web application called MIC Event Report Generator for Microsoft Innovations Club (MIC), VIT Chennai.

The purpose of this application is to automate creation, management, submission, and administration of VIT event reports while preserving the official report format exactly.

The primary objective is to eliminate repetitive manual work while ensuring every generated report is identical in formatting, structure, and layout to the official VIT event report template.

This application should be designed so that organizers only provide event-specific information. Everything else should be automated wherever possible.


---

Reference Assets

Along with this prompt, the following files will be provided:

Official VIT Event Report Template (.docx)

One or more completed sample event reports

All required institutional logos

Faculty signatures

Any other static assets required by the report


Treat these files as the authoritative reference.

The application should use them to:

understand the report structure

preserve formatting

preserve page layout

preserve tables

preserve spacing

preserve fonts

preserve headers

preserve logo placement

preserve overall appearance


Generated reports should closely match the supplied template and sample reports.


---

Authentication

The application should require authentication before any report-related functionality is accessible.

There should only be a single login page.

Authentication is performed using username and password.

After successful login, determine the user's role.

If the user is a regular user:

allow report generation

allow report upload


If the user is an administrator:

provide all normal user capabilities plus:

view uploaded reports

manage templates

manage logos

manage faculty coordinators

manage faculty signatures

manage assets

manage application settings


Do not create separate login pages for different roles.


---

Report Generation

The application should generate reports based on a permanently stored Microsoft Word template.

Users should never upload the template for each report.

The template should be stored by the administrator and reused automatically.


---

Event Details

Collect:

Event Type

Event Title

Start Date

End Date

Start Time

Duration

Venue


Do not request End Time.

Calculate End Time automatically.

Duration should support arbitrary values such as:

90 minutes

3 hours

7 hours

24 hours



---

Event Types

Support configurable event types.

Initially include:

Workshop

Online Workshop

Hackathon

Competition

Guest Lecture

Seminar

Symposium

Conference

Value Added Session

Training Program

Other


These should be configurable by administrators.


---

Venue

Support configurable venue lists.

Initially include:

MG Auditorium

Kasturba Auditorium

Kamaraj Auditorium

Netaji Auditorium

VOC Auditorium

Classroom

Online

Other


If Classroom or Other is selected,

collect the custom venue name.


---

Faculty Coordinators

Faculty coordinators should be managed centrally.

Store:

Employee ID

Name

Department

Electronic Signature


Automatically populate all corresponding fields during report generation.

Users should never repeatedly enter faculty coordinator information.


---

Logos

All logos should be uploaded once by an administrator.

Store them permanently.

During report generation,

allow users to choose which optional logos to include.

Logo placement rules:

VIT Chennai logo must always appear on the left.

Microsoft Innovations Club logo must always appear in the center.

Student Welfare logo must always appear on the right.


Additional logos should automatically occupy remaining positions while maintaining balanced spacing.

Users should never manually position logos.


---

Resource Person

This section is optional.

If enabled,

collect:

Name

Designation

Organization

Place

Email

Mobile Number


If disabled,

omit the section entirely.


---

Event Report

Provide a text area for users to paste their event report.

Do not generate the report from scratch.

Instead,

pass the supplied report through an LLM refinement layer.

The LLM should:

preserve facts

preserve structure

preserve meaning

improve grammar

improve readability

make the writing sound naturally human

avoid stereotypical AI writing patterns

maintain approximately 200–500 words


The purpose is refinement rather than generation.


---

Attendance

Accept an uploaded CSV.

Automatically detect commonly used column names.

Examples include:

Registration Number

Registration No

Reg No

RegNo

Employee ID

Student ID

Name

Student Name

Full Name


Automatically map columns whenever possible.

If mapping cannot be confidently determined,

allow manual mapping.

Generate the attendance table automatically.

Attendance table columns:

Registration Number / Employee ID

Name

Type


Do not include signature columns.

Automatically determine participant type.

Rules:

Student registration number

→ Student

Five-digit employee ID

→ Faculty

Anything else

→ External

Blank registration number

→ Leave Type blank.

Automatically calculate participant count.

Use this value throughout the report.

Never request participant count manually.


---

Images

Users should only upload event images.

No captions.

No descriptions.

No manual ordering.

Automatically:

resize images

optimize image size

preserve aspect ratio

arrange images neatly inside the report

maintain page layout


Require at least two images.

If EXIF metadata exists,

retain useful information such as date and geolocation where applicable.


---

Finance

Finance is optional.

If enabled,

collect:

Expenditure

Revenue

Remarks


Otherwise,

omit the section entirely.


---

Signatures

Faculty coordinator signatures should be inserted automatically using stored backend assets.

Assistant Director Student Welfare signature should remain blank.

Dean / Director signature should remain blank.


---

Automatic Processing

The application should automatically perform repetitive work whenever possible.

Examples include:

Calculate End Time

Calculate Participant Count

Generate Attendance Table

Detect Participant Type

Validate uploaded CSV

Validate report length

Resize uploaded images

Preserve Word formatting

Maintain page layout

Preserve spacing

Prevent page overflow

Maintain proper page breaks



---

Review Before Generation

Before generating the final report,

present a complete summary of all collected information.

Users must be able to edit any section without restarting the workflow.

Editing one section should automatically update any dependent information.

Examples:

Replacing attendance CSV

→ recalculate participant count.

Changing duration

→ recalculate End Time.

Replacing images

→ regenerate document preview.

Editing report

→ preserve all remaining information.

The user should never lose previously entered data.

Generate the report only after final confirmation.


---

Draft Persistence

Automatically save report progress throughout the workflow.

If the browser is refreshed, closed accidentally, or interrupted,

allow users to resume the unfinished report.

Persist whenever technically feasible:

entered information

uploaded CSV

uploaded images

selected options

generated intermediate data


Users should also be able to discard the current draft and start a completely new report.


---

Report Upload

Users should be able to upload an already completed event report.

Collect:

Event Name

Report (.docx)


Automatically rename uploaded files using the convention:

event_name_report.docx

Normalize filenames by:

converting to lowercase

replacing spaces with underscores

removing invalid characters


Store uploaded reports for administrator review.


---

Administrator Features

Administrators should be able to:

View uploaded reports

Download uploaded reports

Replace the official template

Upload and manage logos

Upload and manage faculty signatures

Manage faculty coordinators

Configure event types

Configure venue list

Manage static assets

Configure application defaults


All configuration should be editable through the application.

Avoid hardcoding values wherever practical.


---

Output

Generate:

Microsoft Word (.docx)

PDF (optional)

Preview before export


The generated document should preserve the official formatting, spacing, typography, tables, alignment, page layout, and overall appearance as closely as possible.

The completed report should be visually consistent with the supplied template and sample reports.


---

Engineering Goals

The application should be:

Production-ready

Modular

Easily maintainable

Configurable

Extensible

Responsive

Well documented

Cleanly structured


Design the architecture so that future additions, such as multiple clubs, additional templates, approval workflows, or new report formats, can be implemented with minimal changes to the existing codebase.
