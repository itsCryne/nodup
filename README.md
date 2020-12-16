## NoDup – Ein Discord-Bot, um doppelt versandte Nachrichten zu entfernen.
Du möchtest `NoDup` ausprobieren? Lade dir den Quelltext herunter (Befehl `git clone https://github.com/itsCryne/nodup.git`) und installiere die benötigten Bibliotheken (Befehl `npm install`) Vor dem ersten Start führe den Befehl `tsc` und dann zum Starten der Anwendung `node .` aus.

## Konfiguration
Kopiere die Datei `.env.example` nach `.env`, wo du sie dann bearbeiten kannst.
- `TOKEN` Dein Bot-Token von Discord (zu finden im [Developer Portal](https://discord.com/developers/applications))
- `MESSAGE` Die Warnnachricht bei einer doppelten Nachricht
- `CHANNELS` Mit Leerzeichen getrennte Kanal-IDs die überwacht werden sollen
- `MENTION` Soll der Nutzer in der Warnnachricht erwähnt werden? (true/false)
- `TIMER` Wie hoch soll der Cooldown sein? (in Minuten)
