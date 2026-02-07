use chrono::{DateTime, Utc, SecondsFormat};
use serde::{self, Serializer};

pub fn serialize<S>(
    date: &DateTime<Utc>,
    serializer: S,
) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    let s = date.to_rfc3339_opts(SecondsFormat::Millis, true);
    serializer.serialize_str(&s)
}
