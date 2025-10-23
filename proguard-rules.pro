# Keep all React Native classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Keep all Expo classes
-keep class expo.modules.** { *; }
-keep class com.expo.** { *; }

# Keep all async/await related classes
-keep class kotlinx.coroutines.** { *; }
-keep class kotlin.coroutines.** { *; }

# Keep all JavaScript engine classes
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.jsc.** { *; }

# Keep all Firebase classes
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Keep all navigation classes
-keep class expo.router.** { *; }

# Keep all form submission classes
-keep class * extends java.lang.Exception { *; }

# Don't obfuscate method names that might be called from JavaScript
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep all classes with @Keep annotation
-keep @androidx.annotation.Keep class * { *; }
-keepclassmembers class * {
    @androidx.annotation.Keep *;
}

# Keep all native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep all classes that might be used by reflection
-keep class * implements java.io.Serializable { *; }
-keep class * implements android.os.Parcelable { *; }

# Keep all classes in your app package
-keep class com.yayapana.TransixNewVersion.** { *; }

# Keep all classes that might be called from JavaScript
-keep class * {
    public <init>(...);
    public <methods>;
}

# Don't optimize async operations
-keep class * {
    public * await*(...);
    public * async*(...);
}

# Keep all Promise-related classes
-keep class java.util.concurrent.** { *; }
-keep class java.util.function.** { *; }

# Keep all classes that might be used by async/await
-keep class * implements java.util.concurrent.CompletableFuture { *; }
-keep class * implements java.util.concurrent.Future { *; }

# Keep all classes that might be used by JavaScript async operations
-keep class * {
    public * then*(...);
    public * catch*(...);
    public * finally*(...);
}

# Keep all error handling classes
-keep class * extends java.lang.Throwable { *; }

# New Architecture (Fabric/TurboModules) support
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.react.fabric.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.bridge.** { *; }

# React Native Reanimated support for new architecture
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.gesturehandler.** { *; }

# Keep all classes that might be used by the new architecture
-keep class * implements com.facebook.react.bridge.NativeModule { *; }
-keep class * implements com.facebook.react.bridge.JavaScriptModule { *; }
-keep class * implements com.facebook.react.bridge.ReactContextBaseJavaModule { *; }