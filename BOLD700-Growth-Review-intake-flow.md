# BOLD700 Growth Review intake flow

## Doel
Na betaling moet de klant niet in een gat vallen.
De klant moet direct op een korte vervolgpagina komen waar hij of zij de minimale intake invult.

Doel van deze flow:
- aanvraag vastleggen
- review klaarzetten in het dashboard
- alleen de info verzamelen die nodig is om te starten
- geen lange intake

## Gewenste flow
1. Klant betaalt via Mollie
2. Na betaling komt de klant op een bedank- en intakepagina
3. Klant vult korte intake in
4. Intake wordt opgeslagen in het UX review dashboard
5. Nieuwe aanvraag krijgt status:
   - paid
   - intake_received
   - ready_for_review

## Pagina-opzet

### Titel
Bedankt. Je Growth Review staat klaar.

### Subtitel
Nog een paar korte vragen, dan kunnen we gericht starten.
Dit duurt ongeveer 2 minuten.

### Blok 1: basis
1. Naam
2. E-mailadres
3. Bedrijfsnaam
4. Website URL

## Blok 2: doel
5. Wat wil je dat je website meer oplevert?
Opties:
- meer leads
- meer calls
- meer offerte-aanvragen
- meer verkopen
- anders

6. Wat is nu het grootste probleem van je website?
Opties:
- te weinig aanvragen
- veel bezoekers, weinig actie
- onduidelijke boodschap
- te weinig vertrouwen
- slechte structuur
- weet ik nog niet precies

7. Welke pagina is het belangrijkst om mee te nemen?
Opties:
- homepage
- dienstenpagina
- landingspagina
- contactpagina
- hele site

## Blok 3: context
8. Wie is je belangrijkste doelgroep?
Kort tekstveld

9. Wat wil je dat deze review je vooral oplevert?
Opties:
- snel zien wat er misgaat
- prioriteiten voor verbetering
- concrete actiepunten voor mijn bouwer
- input voor redesign
- meer grip op groei

10. Zijn er specifieke vragen of twijfels die we mee moeten nemen?
Kort open tekstveld

11. Wil je dat we na de review ook kunnen helpen met uitvoering?
Opties:
- ja graag
- misschien
- nee

## Knop
Verstuur intake en start mijn review

## Korte bevestiging na versturen
Top. We hebben je intake ontvangen.
Je review wordt nu voorbereid.
Je ontvangt de volgende stap per mail.

## Wat er in het dashboard moet komen
Per betaalde aanvraag:
- product_name = BOLD700 Growth Review
- amount = 998
- payment_status = paid
- intake_status = received
- full_name
- email
- company_name
- website_url
- primary_goal
- main_problem
- priority_page
- audience
- desired_outcome
- extra_notes
- implementation_help
- created_at
- payment_provider = mollie
- payment_link or payment_id

## Belangrijke UX-regels
- maximaal 2 minuten invullen
- geen lange open vragen
- vooral keuzevelden
- alleen 1 open veld voor extra context
- mobiel moet dit makkelijk invulbaar zijn
- direct na betaling moet dit logisch aanvoelen

## Tone of voice
- kort
- direct
- professioneel
- geen jargon
- geen agency-blabla

## Aanbevolen bedanktekst boven formulier
Bedankt voor je aankoop.
Je Growth Review is gereserveerd.
Beantwoord nog even deze korte vragen, dan kunnen we gericht aan de slag.

## Eventuele extra regel onder knop
Na het versturen ontvang je per mail de bevestiging en vervolgstap.
