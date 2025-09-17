/**
 * CallYourName class provides a simple greeting method.
 *
 * @author Krishnamurthy Donta
 * @since 2025-09-17
 */
public with sharing class CallYourName {
  /**
   * Returns a greeting message for the given name.
   * If the name is blank, returns a default greeting.
   *
   * @param name The name of the person to greet
   * @return A greeting string
   */
  public static String greet(String name) {
    if (String.isBlank(name)) {
      return 'Hello, my friend!';
    }
    return 'Hello, ' + name + '!';
  }
}
