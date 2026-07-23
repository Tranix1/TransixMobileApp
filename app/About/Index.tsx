import React from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { wp, hp } from "@/constants/common";
import { useThemeColor } from "@/hooks/useThemeColor";
import { BRAND } from "@/constants/Colors";

// -----------------------------------------------------------------------
// THEME NOTES
// All surface / text colors now come from useThemeColor(key), reading
// straight out of Colors.light / Colors.dark, so this screen adapts
// automatically to the app's theme. Brand colors (navy/teal/amber/etc.)
// are identical in both palettes, so they're pulled directly from BRAND
// for use inside module-level data (arrays can't call hooks) and mixed
// with the adaptive "accent" / "accentlight" tokens for interactive bits.
// -----------------------------------------------------------------------

type IoniconName = keyof typeof Ionicons.glyphMap;

// Adds an alpha channel to a hex color so brand-colored chips/backgrounds
// blend naturally over whatever surface color is beneath them, in either
// theme (RN performs real alpha compositing on 8-digit hex).
const hexWithAlpha = (hex: string, alpha: string) => `${hex}${alpha}`;

interface Feature {
  icon: IoniconName;
  color: string;
  title: string;
  description: string;
  points: string[];
}

interface WhyItem {
  icon: IoniconName;
  color: string;
  title: string;
  description: string;
}

interface Step {
  icon: IoniconName;
  title: string;
}

const FEATURES: Feature[] = [
  {
    icon: "car-sport-outline",
    color: BRAND.navy,
    title: "Fleet Management",
    description: "Everything a fleet owner needs, in one place.",
    points: [
      "Manage trucks",
      "Track truck status",
      "Subscriptions",
      "GPS integration",
      "Invite drivers",
      "Manage maintenance",
    ],
  },
  {
    icon: "briefcase-outline",
    color: BRAND.amber,
    title: "Brokerage",
    description: "Source loads and move freight with confidence.",
    points: [
      "Private loads",
      "Public loads",
      "Assign trucks",
      "Track deliveries",
      "Access fleet information",
      "View live truck status",
    ],
  },
  {
    icon: "people-outline",
    color: BRAND.teal,
    title: "Driver Management",
    description: "A simple, verified relationship between fleets and drivers.",
    points: [
      "Drivers create their own accounts",
      "Fleet owners invite drivers",
      "Drivers approve the invitation",
      "Relationship is created",
    ],
  },
  {
    icon: "swap-horizontal-outline",
    color: BRAND.navy,
    title: "Trip Management",
    description: "From assignment to delivery, fully tracked.",
    points: [
      "Create assignments",
      "Start trips",
      "Complete trips",
      "View progress",
      "Track deliveries",
    ],
  },
  {
    icon: "navigate-outline",
    color: BRAND.good,
    title: "Live GPS Tracking",
    description: "Know where every vehicle is, in real time.",
    points: [
      "Live location",
      "Journey history",
      "Share tracking",
      "Load owners can monitor trips when GPS is available",
    ],
  },
  {
    icon: "wallet-outline",
    color: BRAND.amber,
    title: "Finance",
    description: "Clear visibility into money in and money out.",
    points: [
      "Track income",
      "Track expenses",
      "Profit overview",
      "Transaction history",
      "Referral earnings",
      "Referral wallet",
    ],
  },
  {
    icon: "person-circle-outline",
    color: BRAND.teal,
    title: "Public Profiles",
    description: "Build reputation and trust in the marketplace.",
    points: [
      "Verified businesses",
      "Business ratings",
      "Loads completed",
      "Trips completed",
      "Fleet size",
      "Acceptance rate",
      "Followers",
      "Profile views",
    ],
  },
  {
    icon: "shield-checkmark-outline",
    color: BRAND.bad,
    title: "Verification",
    description: "Every user is verified before accessing services.",
    points: ["Safe and trusted marketplace"],
  },
];

const WHY_ITEMS: WhyItem[] = [
  {
    icon: "shield-checkmark-outline",
    color: BRAND.teal,
    title: "Verified Businesses",
    description: "Every fleet and brokerage is verified before they can operate.",
  },
  {
    icon: "navigate-outline",
    color: BRAND.good,
    title: "Real-Time Tracking",
    description: "Live GPS visibility across every active trip.",
  },
  {
    icon: "bulb-outline",
    color: BRAND.amber,
    title: "Smart Logistics",
    description: "Tools that make fleet and load management effortless.",
  },
  {
    icon: "earth-outline",
    color: BRAND.navy,
    title: "Growing African Network",
    description: "A rapidly expanding community of transporters and brokers.",
  },
  {
    icon: "person-circle-outline",
    color: BRAND.teal,
    title: "Business Profiles",
    description: "Showcase your track record and win more business.",
  },
  {
    icon: "cash-outline",
    color: BRAND.amber,
    title: "Referral Rewards",
    description: "Earn ongoing passive income for every business you bring in.",
  },
  {
    icon: "lock-closed-outline",
    color: BRAND.bad,
    title: "Secure Platform",
    description: "Built with safety and reliability at its core.",
  },
];

const STEPS: Step[] = [
  { icon: "person-add-outline", title: "Create Account" },
  { icon: "shield-checkmark-outline", title: "Verify Account" },
  { icon: "business-outline", title: "Create Fleet or Brokerage" },
  { icon: "car-sport-outline", title: "Add Trucks" },
  { icon: "people-outline", title: "Invite Drivers" },
  { icon: "cube-outline", title: "Create Loads" },
  { icon: "swap-horizontal-outline", title: "Assign Trucks" },
  { icon: "navigate-outline", title: "Track Trips" },
  { icon: "trending-up-outline", title: "Grow Your Business" },
];

function About() {
  const isDark = useColorScheme() === "dark";

  const background = useThemeColor("background");
  const backgroundLight = useThemeColor("backgroundLight");
  const text = useThemeColor("text");
  const textlight = useThemeColor("textlight");
  const border = useThemeColor("border");
  const accent = useThemeColor("accent");
  const accentlight = useThemeColor("accentlight");
  const navy = useThemeColor("navy");
  const teal = useThemeColor("teal");
  const amber = useThemeColor("amber");

  // Tint used behind feature/why icons — a touch stronger in dark mode
  // so brand colors still read clearly against a near-black surface.
  const chipAlpha = isDark ? "35" : "18";

  const openWhatsApp = () => {
    const phoneNumber = "263716325160";
    const message =
      "Hello Transix, I would like more information about your services.";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    Linking.openURL(url);
  };

  const openEmail = () => {
    const email = "transix16@gmail.com";
    const subject = "Inquiry about Transix Services";
    const body = "Hello, I would like to learn more about your platform.";
    const url = `mailto:${email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    Linking.openURL(url);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: background }}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ================= HERO ================= */}
      {/* Kept as an intentional dark navy "brand" surface in both themes,
          the way a logo lockup or splash card would be — it's meant to
          pop rather than blend into the page. */}
      <View style={[styles.hero, { backgroundColor: navy }]}>
        <View style={styles.heroIconRow}>
          <View style={[styles.heroBadge, { backgroundColor: "rgba(255,255,255,0.12)" }]}>
            <Ionicons name="car-sport" size={wp(7)} color="#FFFFFF" />
          </View>
          <View style={[styles.heroBadge, { backgroundColor: "rgba(255,255,255,0.12)" }]}>
            <Ionicons name="navigate" size={wp(7)} color="#FFFFFF" />
          </View>
          <View style={[styles.heroBadge, { backgroundColor: "rgba(255,255,255,0.12)" }]}>
            <Ionicons name="wallet" size={wp(7)} color="#FFFFFF" />
          </View>
        </View>

        <ThemedText style={styles.heroTitle}>Transix</ThemedText>
        <ThemedText style={[styles.heroSlogan, { color: teal }]}>
          Connecting Africa's Logistics
        </ThemedText>
        <ThemedText style={styles.heroDescription}>
          The modern operating system for transport and logistics — built
          for fleets, brokers, and drivers who move Africa forward.
        </ThemedText>
      </View>

      {/* ================= WHO WE ARE ================= */}
      <View style={styles.section}>
        <SectionHeader
          eyebrow="Who We Are"
          title="One platform, every part of your logistics business"
          textColor={text}
          accentColor={teal}
        />
        <ThemedText style={[styles.paragraph, { color: textlight }]}>
          Transix is an all-in-one logistics platform designed for Africa —
          bringing vehicle tracking, fleet management, brokerage, load
          management, trip management, finance, driver management, public
          business profiles, analytics, and verification together in a
          single, connected system.
        </ThemedText>

        <View style={styles.pillRow}>
          {[
            "Vehicle Tracking",
            "Fleet Management",
            "Brokerage",
            "Load Management",
            "Trip Management",
            "Finance",
            "Driver Management",
            "Public Profiles",
            "Analytics",
            "Verification",
          ].map((pill) => (
            <View
              key={pill}
              style={[
                styles.pill,
                { backgroundColor: accentlight, borderColor: border },
              ]}
            >
              <ThemedText style={[styles.pillText, { color: text }]}>
                {pill}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* ================= KEY FEATURES ================= */}
      <View style={styles.section}>
        <SectionHeader
          eyebrow="Key Features"
          title="Built for how transport businesses actually work"
          textColor={text}
          accentColor={teal}
        />

        <View style={{ gap: wp(4) }}>
          {FEATURES.map((feature) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              card={backgroundLight}
              border={border}
              text={text}
              muted={textlight}
              chipAlpha={chipAlpha}
            />
          ))}
        </View>
      </View>

      {/* ================= PRICING ================= */}
      <View style={styles.section}>
        <SectionHeader
          eyebrow="Pricing"
          title="Simple, transparent pricing"
          textColor={text}
          accentColor={teal}
        />

        {/* Tracking */}
        <View style={[styles.pricingCard, { backgroundColor: backgroundLight, borderColor: border }]}>
          <View style={styles.pricingHeaderRow}>
            <View style={[styles.pricingIcon, { backgroundColor: hexWithAlpha(teal, chipAlpha) }]}>
              <Ionicons name="navigate-outline" size={wp(5.5)} color={teal} />
            </View>
            <ThemedText style={[styles.pricingTitle, { color: text }]}>
              Tracking
            </ThemedText>
          </View>

          <PriceRow label="GPS Device" value="US$40 once" text={text} muted={textlight} border={border} />
          <PriceRow label="Installation (Harare)" value="US$20" text={text} muted={textlight} border={border} />
          <PriceRow
            label="Outside Harare"
            value="Transport costs apply"
            text={text}
            muted={textlight}
            border={border}
          />
          <PriceRow
            label="Outside Zimbabwe"
            value="Arranged by Transix"
            text={text}
            muted={textlight}
            border={border}
          />
        </View>

        {/* Fleet + Brokerage side by side — kept as bold brand-colored
            cards in both themes so pricing still pops off the page. */}
        <View style={styles.pricingGrid}>
          <View style={[styles.planCard, { backgroundColor: navy }]}>
            <View style={[styles.planBadge, { backgroundColor: "rgba(255,255,255,0.12)" }]}>
              <Ionicons name="car-sport-outline" size={wp(5)} color="#FFFFFF" />
            </View>
            <ThemedText style={styles.planTitle}>Fleet Subscription</ThemedText>
            <View style={styles.planPriceRow}>
              <ThemedText style={styles.planPrice}>US$15</ThemedText>
              <ThemedText style={styles.planPriceUnit}>/ truck / month</ThemedText>
            </View>
            <View style={styles.planFeatures}>
              {["GPS Tracking", "Fleet Management", "Trip Management", "Analytics"].map(
                (item) => (
                  <View key={item} style={styles.planFeatureRow}>
                    <Ionicons name="checkmark-circle" size={wp(4)} color={teal} />
                    <ThemedText style={styles.planFeatureText}>{item}</ThemedText>
                  </View>
                )
              )}
            </View>
          </View>

          <View style={[styles.planCard, { backgroundColor: teal }]}>
            <View style={[styles.planBadge, { backgroundColor: "rgba(255,255,255,0.16)" }]}>
              <Ionicons name="briefcase-outline" size={wp(5)} color="#FFFFFF" />
            </View>
            <ThemedText style={styles.planTitle}>Brokerage Subscription</ThemedText>
            <View style={styles.planPriceRow}>
              <ThemedText style={styles.planPrice}>US$10</ThemedText>
              <ThemedText style={styles.planPriceUnit}>/ month</ThemedText>
            </View>
            <View style={styles.planFeatures}>
              {[
                "Public Loads",
                "Private Loads",
                "Truck Assignment",
                "Fleet Access",
                "Trip Tracking",
              ].map((item) => (
                <View key={item} style={styles.planFeatureRow}>
                  <Ionicons name="checkmark-circle" size={wp(4)} color={amber} />
                  <ThemedText style={styles.planFeatureText}>{item}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* ================= REFERRAL PROGRAM ================= */}
      <View style={styles.section}>
        <View style={[styles.referralCard, { backgroundColor: teal }]}>
          <View style={styles.referralHeaderRow}>
            <View style={[styles.referralIcon, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
              <Ionicons name="gift-outline" size={wp(6)} color="#FFFFFF" />
            </View>
            <ThemedText style={styles.referralTitle}>Referral Program</ThemedText>
          </View>

          <ThemedText style={styles.referralSubtitle}>
            Turn your network into passive monthly income.
          </ThemedText>

          <View style={styles.referralRow}>
            <View style={styles.referralItem}>
              <ThemedText style={styles.referralAmount}>US$5</ThemedText>
              <ThemedText style={styles.referralLabel}>
                per month, per referred brokerage that stays subscribed
              </ThemedText>
            </View>
            <View style={styles.referralDivider} />
            <View style={styles.referralItem}>
              <ThemedText style={styles.referralAmount}>US$3</ThemedText>
              <ThemedText style={styles.referralLabel}>
                per month, per referred truck that stays subscribed
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      {/* ================= HOW IT WORKS ================= */}
      <View style={styles.section}>
        <SectionHeader
          eyebrow="How It Works"
          title="From sign up to scale, in nine steps"
          textColor={text}
          accentColor={teal}
        />

        <View style={styles.timeline}>
          {STEPS.map((step, index) => (
            <View key={step.title} style={styles.timelineRow}>
              <View style={styles.timelineIconColumn}>
                <View style={[styles.timelineIcon, { backgroundColor: hexWithAlpha(teal, chipAlpha) }]}>
                  <Ionicons name={step.icon} size={wp(4.5)} color={teal} />
                </View>
                {index !== STEPS.length - 1 && (
                  <View style={[styles.timelineLine, { backgroundColor: border }]} />
                )}
              </View>
              <ThemedText style={[styles.timelineText, { color: text }]}>
                {step.title}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* ================= WHY TRANSIX ================= */}
      <View style={styles.section}>
        <SectionHeader
          eyebrow="Why Transix"
          title="Trusted by fleets and brokers across the region"
          textColor={text}
          accentColor={teal}
        />

        <View style={styles.whyGrid}>
          {WHY_ITEMS.map((item) => (
            <View
              key={item.title}
              style={[styles.whyCard, { backgroundColor: backgroundLight, borderColor: border }]}
            >
              <View style={[styles.whyIcon, { backgroundColor: hexWithAlpha(item.color, chipAlpha) }]}>
                <Ionicons name={item.icon} size={wp(5)} color={item.color} />
              </View>
              <ThemedText style={[styles.whyTitle, { color: text }]}>
                {item.title}
              </ThemedText>
              <ThemedText style={[styles.whyDescription, { color: textlight }]}>
                {item.description}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* ================= CONTACT US ================= */}
      <View style={styles.section}>
        <View style={[styles.contactCard, { backgroundColor: backgroundLight, borderColor: border }]}>
          <SectionHeader
            eyebrow="Contact Us"
            title="Talk to our team"
            textColor={text}
            accentColor={teal}
          />
          <ThemedText style={[styles.paragraph, { color: textlight }]}>
            Need GPS installation? Need onboarding? Need help choosing a
            subscription? Our team is ready to help you get set up and
            moving.
          </ThemedText>

          <TouchableOpacity
            onPress={openWhatsApp}
            style={[styles.contactButton, { backgroundColor: "#25D366" }]}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-whatsapp" size={wp(5)} color="#FFFFFF" />
            <ThemedText style={styles.contactButtonText}>
              Chat on WhatsApp
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={openEmail}
            style={[styles.contactButton, { backgroundColor: navy }]}
            activeOpacity={0.85}
          >
            <Ionicons name="mail-outline" size={wp(5)} color="#FFFFFF" />
            <ThemedText style={styles.contactButtonText}>Send Email</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: hp(4) }} />
    </ScrollView>
  );
}

export default About;

// -----------------------------------------------------------------------
// Reusable subcomponents
// -----------------------------------------------------------------------

function SectionHeader({
  eyebrow,
  title,
  textColor,
  accentColor,
}: {
  eyebrow: string;
  title: string;
  textColor: string;
  accentColor: string;
}) {
  return (
    <View style={{ marginBottom: hp(1.6) }}>
      <ThemedText style={[styles.eyebrow, { color: accentColor }]}>
        {eyebrow.toUpperCase()}
      </ThemedText>
      <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
        {title}
      </ThemedText>
    </View>
  );
}

function FeatureCard({
  feature,
  card,
  border,
  text,
  muted,
  chipAlpha,
}: {
  feature: Feature;
  card: string;
  border: string;
  text: string;
  muted: string;
  chipAlpha: string;
}) {
  return (
    <View style={[styles.featureCard, { backgroundColor: card, borderColor: border }]}>
      <View style={styles.featureHeaderRow}>
        <View style={[styles.featureIcon, { backgroundColor: hexWithAlpha(feature.color, chipAlpha) }]}>
          <Ionicons name={feature.icon} size={wp(5.5)} color={feature.color} />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText style={[styles.featureTitle, { color: text }]}>
            {feature.title}
          </ThemedText>
          <ThemedText style={[styles.featureDescription, { color: muted }]}>
            {feature.description}
          </ThemedText>
        </View>
      </View>

      <View style={styles.featurePoints}>
        {feature.points.map((point) => (
          <View key={point} style={styles.featurePointRow}>
            <View style={[styles.featureDot, { backgroundColor: feature.color }]} />
            <ThemedText style={[styles.featurePointText, { color: muted }]}>
              {point}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

function PriceRow({
  label,
  value,
  text,
  muted,
  border,
}: {
  label: string;
  value: string;
  text: string;
  muted: string;
  border: string;
}) {
  return (
    <View style={[styles.priceRow, { borderTopColor: border }]}>
      <ThemedText style={[styles.priceLabel, { color: muted }]}>{label}</ThemedText>
      <ThemedText style={[styles.priceValue, { color: text }]}>{value}</ThemedText>
    </View>
  );
}

// -----------------------------------------------------------------------
// Styles (colors applied inline via theme tokens above; layout only here)
// -----------------------------------------------------------------------

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: hp(2),
  },

  // Hero
  hero: {
    paddingHorizontal: wp(6),
    paddingTop: hp(7),
    paddingBottom: hp(5),
    borderBottomLeftRadius: wp(8),
    borderBottomRightRadius: wp(8),
    alignItems: "center",
  },
  heroIconRow: {
    flexDirection: "row",
    gap: wp(3),
    marginBottom: hp(2.5),
  },
  heroBadge: {
    width: wp(13),
    height: wp(13),
    borderRadius: wp(3.5),
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: wp(10),
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  heroSlogan: {
    fontSize: wp(4.5),
    fontWeight: "600",
    marginTop: hp(0.6),
    textAlign: "center",
  },
  heroDescription: {
    fontSize: wp(3.6),
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    marginTop: hp(1.6),
    lineHeight: wp(5.2),
    paddingHorizontal: wp(2),
  },

  // Sections
  section: {
    paddingHorizontal: wp(5),
    marginTop: hp(4),
  },
  eyebrow: {
    fontSize: wp(3),
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: hp(0.6),
  },
  sectionTitle: {
    fontSize: wp(5.2),
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  paragraph: {
    fontSize: wp(3.7),
    lineHeight: wp(5.4),
    marginTop: hp(1),
  },

  // Pills
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(2),
    marginTop: hp(2),
  },
  pill: {
    paddingHorizontal: wp(3.2),
    paddingVertical: hp(0.8),
    borderRadius: wp(5),
    borderWidth: 1,
  },
  pillText: {
    fontSize: wp(3.2),
    fontWeight: "600",
  },

  // Feature cards
  featureCard: {
    borderRadius: wp(4.5),
    borderWidth: 1,
    padding: wp(4.5),
    marginTop: hp(2),
  },
  featureHeaderRow: {
    flexDirection: "row",
    gap: wp(3),
    alignItems: "flex-start",
  },
  featureIcon: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(3),
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: {
    fontSize: wp(4.2),
    fontWeight: "700",
  },
  featureDescription: {
    fontSize: wp(3.3),
    marginTop: hp(0.3),
    lineHeight: wp(4.6),
  },
  featurePoints: {
    marginTop: hp(1.6),
    gap: hp(0.8),
  },
  featurePointRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2.2),
  },
  featureDot: {
    width: wp(1.6),
    height: wp(1.6),
    borderRadius: wp(1),
  },
  featurePointText: {
    fontSize: wp(3.3),
  },

  // Pricing
  pricingCard: {
    borderRadius: wp(4.5),
    borderWidth: 1,
    padding: wp(4.5),
    marginTop: hp(2),
  },
  pricingHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2.5),
    marginBottom: hp(1.6),
  },
  pricingIcon: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(2.5),
    alignItems: "center",
    justifyContent: "center",
  },
  pricingTitle: {
    fontSize: wp(4.2),
    fontWeight: "700",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: hp(1),
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  priceLabel: {
    fontSize: wp(3.5),
  },
  priceValue: {
    fontSize: wp(3.5),
    fontWeight: "700",
  },

  pricingGrid: {
    flexDirection: "row",
    gap: wp(3),
    marginTop: hp(2),
  },
  planCard: {
    flex: 1,
    borderRadius: wp(4.5),
    padding: wp(4),
  },
  planBadge: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(2.5),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp(1.2),
  },
  planTitle: {
    fontSize: wp(3.5),
    fontWeight: "700",
    color: "#FFFFFF",
  },
  planPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: wp(1),
    marginTop: hp(1),
    marginBottom: hp(1.4),
  },
  planPrice: {
    fontSize: wp(6),
    fontWeight: "800",
    color: "#FFFFFF",
  },
  planPriceUnit: {
    fontSize: wp(2.8),
    color: "rgba(255,255,255,0.7)",
  },
  planFeatures: {
    gap: hp(0.8),
  },
  planFeatureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(1.8),
  },
  planFeatureText: {
    fontSize: wp(3),
    color: "rgba(255,255,255,0.85)",
  },

  // Referral
  referralCard: {
    borderRadius: wp(5),
    padding: wp(5),
  },
  referralHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
  },
  referralIcon: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(3),
    alignItems: "center",
    justifyContent: "center",
  },
  referralTitle: {
    fontSize: wp(4.6),
    fontWeight: "800",
    color: "#FFFFFF",
  },
  referralSubtitle: {
    fontSize: wp(3.5),
    color: "rgba(255,255,255,0.9)",
    marginTop: hp(1.4),
  },
  referralRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(2.4),
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: wp(4),
    padding: wp(4),
  },
  referralItem: {
    flex: 1,
  },
  referralDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.25)",
    marginHorizontal: wp(3),
  },
  referralAmount: {
    fontSize: wp(6.5),
    fontWeight: "800",
    color: "#FFFFFF",
  },
  referralLabel: {
    fontSize: wp(2.9),
    color: "rgba(255,255,255,0.85)",
    marginTop: hp(0.5),
    lineHeight: wp(4),
  },

  // Timeline
  timeline: {
    marginTop: hp(2),
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: wp(3),
  },
  timelineIconColumn: {
    alignItems: "center",
  },
  timelineIcon: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(4.5),
    alignItems: "center",
    justifyContent: "center",
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: hp(3),
  },
  timelineText: {
    fontSize: wp(3.7),
    fontWeight: "600",
    paddingTop: hp(1),
    paddingBottom: hp(1.6),
  },

  // Why grid
  whyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(3),
    marginTop: hp(2),
  },
  whyCard: {
    width: "47%",
    borderRadius: wp(4),
    borderWidth: 1,
    padding: wp(3.6),
  },
  whyIcon: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(2.5),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp(1),
  },
  whyTitle: {
    fontSize: wp(3.4),
    fontWeight: "700",
  },
  whyDescription: {
    fontSize: wp(2.9),
    marginTop: hp(0.4),
    lineHeight: wp(4),
  },

  // Contact
  contactCard: {
    borderRadius: wp(5),
    borderWidth: 1,
    padding: wp(4.5),
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp(2),
    paddingVertical: hp(1.6),
    borderRadius: wp(3),
    marginTop: hp(1.6),
  },
  contactButtonText: {
    color: "#FFFFFF",
    fontSize: wp(3.8),
    fontWeight: "700",
  },
});
``