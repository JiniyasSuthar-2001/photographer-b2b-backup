import os

def cleanup_referral_notes(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.startswith("user_") and file.endswith(".md"):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Remove the note about referral_code_applied at signup
                old_note = "> Optionally fill referral_code_applied with a friend's code to register the referral relationship."
                new_note = "> Use Section 4 (Apply Referral Code) to register a referral after signup but before purchase."
                content = content.replace(old_note, new_note)

                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Cleaned notes in {filepath}")

if __name__ == "__main__":
    base_dir = r"c:\Users\Jiniyas Suthar\OneDrive\Desktop\New folder\postman_scenarios"
    cleanup_referral_notes(base_dir)
