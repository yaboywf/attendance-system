import React from "react";
import { useOutletContext } from 'react-router-dom';

function HelpPage() {
    const { user } = useOutletContext();

    return (
        <div className="help">
            <h1>Help Page</h1>

            <section>
                <h2>Overview</h2>

                <h3>Website&apos;s Purpose</h3>
                <p>The purpose of this website is to better facilitate the attendance of organisations through automated attendance marking systems and criterias fulfilment.</p>
                
                <h3>Target Audience</h3>
                <p>This website aims to optimize attendance-related activities for both <strong>students</strong> and <strong>lecturers</strong>, primarily targeting educational institutions. However, it is also suitable for organizations with similar structural needs.</p>
                
                <h3>Features</h3>
                <p>This website offers 2 account types:</p>
                <ol>
                    <li>Student account</li>
                    <li>Lecturer account</li>
                </ol>
                <p>Each account type will have access to only certain features. This features are stated below.</p>

                <div className="help-table">
                    <p>Feature</p>
                    <p>Students</p>
                    <p>Lecturers</p>

                    <p>Home / Dashboard (Student View)</p>
                    <p>
                        <i className="fa-solid fa-check"></i>
                    </p>
                    <p>
                        <i className="fa-solid fa-xmark"></i>
                    </p>

                    <p>Submit MC / LOA</p>
                    <p>
                        <i className="fa-solid fa-check"></i>
                    </p>
                    <p>
                        <i className="fa-solid fa-xmark"></i>
                    </p>

                    <p>Mark Attendance</p>
                    <p>
                        <i className="fa-solid fa-check"></i>
                    </p>
                    <p>
                        <i className="fa-solid fa-xmark"></i>
                    </p>

                    <p>My Attendance</p>
                    <p>
                        <i className="fa-solid fa-check"></i>
                    </p>
                    <p>
                        <i className="fa-solid fa-xmark"></i>
                    </p>

                    <p>My MC / LOA</p>
                    <p>
                        <i className="fa-solid fa-check"></i>
                    </p>
                    <p>
                        <i className="fa-solid fa-xmark"></i>
                    </p>

                    <p>Home / Dashboard (Lecturer View)</p>
                    <p>
                        <i className="fa-solid fa-xmark"></i>
                    </p>
                    <p>
                        <i className="fa-solid fa-check"></i>
                    </p>

                    <p>User Management</p>
                    <p>
                        <i className="fa-solid fa-xmark"></i>
                    </p>
                    <p>
                        <i className="fa-solid fa-check"></i>
                    </p>

                    <p>Student Attendance</p>
                    <p>
                        <i className="fa-solid fa-xmark"></i>
                    </p>
                    <p>
                        <i className="fa-solid fa-check"></i>
                    </p>

                    <p>Approve MC / LOA</p>
                    <p>
                        <i className="fa-solid fa-xmark"></i>
                    </p>
                    <p>
                        <i className="fa-solid fa-check"></i>
                    </p>

                    <p>My Profile</p>
                    <p>
                        <i className="fa-solid fa-check"></i>
                    </p>
                    <p>
                        <i className="fa-solid fa-check"></i>
                    </p>
                </div>
                
                <p><strong>Note that in this help page, you will see the guide to features that you have access to.</strong></p>
            </section>

            {user?.account_type.toLowerCase() === "student" && <>
            <section>    
                <h2>Home / Dashboard (Student&apos;s View)</h2>

                <h3>Graphs & Statistics</h3>
                <p>Understanding your attendance patterns is key to ensuring consistent participation and meeting your educational goals.</p>
                <ul>
                    <li><strong>Attendance Rate:</strong> View your overall attendance percentage. This will give you a clear picture of your commitment and engagement.</li>
                    <li><strong>Submitted MC / LOA:</strong> See the number of MC / LOA forms you have submitted. This graph can help gauge whether you have exceeded the allowed limit.</li>
                </ul>
                <p>These statistics are tailored specifically to your attendance, providing a personalized view of how well you&apos;re doing and where you can improve.</p>
            </section>

            <section>
                <h2>Submit MC / LOA</h2>
                
                <h3>Submission of MC</h3>
                <p>To Submit a Medical Certificate:</p>

                <p><strong>On Desktop:</strong></p>
                <ol>
                    <li>Click on &quot;Submit MC / LOA&quot; button on the sidebar on the left</li>
                    <li>In the toggle button at the top, select &quot;MC&quot;. A black background would be shown on the selected form type</li>
                    <li>Fill in the form. <strong>All Fields are required.</strong></li>
                    <li>After filling in the form, click on the &quot;Submit&quot; button</li>
                </ol>

                <p><strong>On Mobile:</strong></p>
                <ol>
                    <li>Click the menu icon at the top left of the page</li>
                    <li>Click on &quot;Submit MC / LOA&quot;</li>
                    <li>In the toggle button at the top, select &quot;MC&quot;. A black background would be shown on the selected form type</li>
                    <li>Fill in the form. <strong>All Fields are required.</strong></li>
                    <li>After filling in the form, click on the &quot;Submit&quot; button</li>
                </ol>

                <h3>Submission of LOA</h3>
                <p>To Submit a Leave of Absence:</p>

                <p><strong>On Desktop:</strong></p>
                <ol>
                    <li>Click on &quot;Submit MC / LOA&quot; button on the sidebar on the left</li>
                    <li>In the toggle button at the top, select &quot;LOA&quot;. A black background would be shown on the selected form type</li>
                    <li>Fill in the form. <strong>All Fields are required.</strong></li>
                    <li>After filling in the form, click on the &quot;Submit&quot; button</li>
                </ol>

                <p><strong>On Mobile:</strong></p>
                <ol>
                    <li>Click the menu icon at the top left of the page</li>
                    <li>Click on &quot;Submit MC / LOA&quot;</li>
                    <li>In the toggle button at the top, select &quot;LOA&quot;. A black background would be shown on the selected form type</li>
                    <li>Fill in the form. <strong>All Fields are required.</strong></li>
                    <li>After filling in the form, click on the &quot;Submit&quot; button</li>
                </ol>

                <hr />

                <p><strong>Ensure that all information is accurate and up-to-date.</strong></p>
                <p>Please refer to your organisation&apos;s requirements on submission of Medical Certificates and Leave Of Absence</p>
                <p>AttendEase is <strong>NOT</strong> responsible for the approval of your attendance. We are also <strong>NOT</strong> liable for any inaccuracies or errors in the data you provide, including but not limited to incorrect personal details or missing information. It is your responsibility to ensure that all required documents and information are submitted correctly and on time for proper processing.</p>
            </section>

            <section>
                <h2>Mark Attendance</h2>

                <h3>Marking your attendance</h3>
                <p>To mark your own attendance:</p>
                <ol>
                    <li>Click on &quot;Mark Attendance&quot; button on the sidebar on the left</li>
                    <li>Click on the &quot;Mark Attendance&quot; button in the center of your screen</li>
                    <li>Criterias and checks would run as shown in the table below the button</li>
                    <li>Only when all criterias have been met (signified by check marks on all rows) will your attendance be marked</li>
                    <li>If a criteria cannot be fulfilled, you will be shown an error message. Your attendance <strong>WILL NOT</strong> be taken</li>
                </ol>
                <p><strong>Note that Lecturer accounts are able to override your attendance status if they deem it necessary.</strong></p>

                <h3>Criterias</h3>
                <p>AttendEase performs several checks to verify that you are truly present when taking attendance.</p>
                <p>We will not go into detail about these checks to prevent misuse of the system and to maintain the integrity of our attendance validation process, however checks that we perform include:</p>
                <ol>
                    <li>Geo-location related</li>
                    <li>Network related</li>
                    <li>Face Recognition</li>
                </ol>
                <p><strong>Note that your device must have Geo-location and Camera capability in order to perform these checks.</strong> Do use a different device if you do not have access to a device with these capabilities.</p>
            </section>

            <section>
                <h2>My Attendance</h2>

                <p>Users are able to view their own attendance history</p>
                <p>Lecturers may state a remark for a particular attendance record</p>
                <p><strong>Inform and discuss with your lecturer if you are unable to mark your attendance</strong></p>
                <p><strong>Note that Lecturer accounts are able to override your attendance status if they deem it necessary.</strong></p>
            </section>

            <section>
                <h2>My MC / LOA</h2>

                <p>Users are able to view their submitted MC / LOA history</p>
                <p>All MC / LOA requests are subject to approval</p>
                <p><strong>Inform and discuss with your lecturer if you are unable to submit a MC / LOA</strong></p>
                <p><strong>Note that Lecturer accounts are able to reject your MC / LOA if they deem it necessary.</strong></p>
            </section>
            </>}

            {user?.account_type.toLowerCase() === "lecturer" && <>
            <section>    
                <h2>Home / Dashboard (Lecturer&apos;s View)</h2>

                <h3>Graphs & Statistics</h3>
                <p>Understanding your attendance patterns is key to ensuring consistent participation and meeting your educational goals.</p>
                <ul>
                    <li><strong>Overall Attendance Rate:</strong> View your class&apos;s overall attendance percentage. This will give you a clear picture of your class&apos;s commitment and engagement.</li>
                </ul>
                <p>These statistics are tailored specifically to your class, providing a personalized view of how well your class is doing and where they can improve.</p>
            </section>

            <section>
                <h2>User Management</h2>
                <p>You are able to see all <strong>Lecturer</strong> and <strong>Student</strong> accounts</p>
                <p>A search field is provided to find specific accounts</p>

                <h3>Creating an Account</h3>
                <ol>
                    <li>Click on the &quot;Create New Account&quot; button located at the top right of the screen</li>
                    <li>Fill in all fields</li>
                    <li>Remember to change to the desired account type if necessary</li>
                    <li>For the creation of accounts, there are no password requirements, however, it is recommended to create a strong password</li>
                    <li><strong>Upload a clear profile picture. This will be the reference image used for students to mark their attendance</strong></li>
                    <li>Click &quot;Create&quot;</li>
                </ol>

                <h3>Updating an Account</h3>
                <ol>
                    <li>Find and click on the account you wish to edit</li>
                    <li>Update the desired fields</li>
                    <li>To update the profile picture, click on the existing profile picture and upload a new one</li>
                    <li>Click &quot;Update&quot;</li>
                </ol>

                <h3>Deleting an Account</h3>
                <ol>
                    <li>Find and click on the account you wish to delete</li>
                    <li>Click &quot;Delete&quot;</li>
                </ol>
                <p><strong>This action is irreversible</strong></p>
            </section>

            <section>
                <h2>Student Attendance</h2>

                <p>You are able to view your students&apos; attendance history</p>
                <p>A search input is available to filter by student name</p>

                <h3>Editing Student&apos;s Attendance</h3>
                <ol>
                    <li>Find the student you wish to edit</li>
                    <li>Click on the Edit Icon located at the most right column of the table</li>
                    <li>Change the attendance status by selecting the desired option in the dropdown</li>
                    <li>Add a remark if necessary</li>
                    <li>Click &quot;Update&quot;</li>
                </ol>

                <h3>Removing Student&apos;s Attendance</h3>
                <p>This may be useful when the attendance is invalid, etc</p>
                <ol>
                    <li>Find the student you wish to edit</li>
                    <li>Click on the Edit Icon located at the most right column of the table</li>
                    <li>Click &quot;Delete&quot;</li>
                </ol>
            </section>

            <section>
                <h2>Approve MC / LOA</h2>
                <p>Lecturers are able to approve MC / LOA requests</p>
                <p>Note that a reason is not required for MC</p>
                
                <h3>Viewing MC / LOA Requests</h3>
                <ul>
                    <li>A table would be visible to you</li>
                    <li>It would contain key information such as the type of request (MC / LOA), the student&apos;s name, reason (if any), etc</li>
                    <li>A search input is available to filter by student name</li>
                    <li>You can also filter by MC / LOA type, OR pending requests</li>
                </ul>

                <h3>Approving / Rejecting MC / LOA Requests</h3>
                <ol>
                    <li>Find the request you wish to edit</li>
                    <li>Click on the Edit Icon located at the most right column of the table</li>
                    <li>The number of approvals and rejections will also be displayed</li>
                    <li>Change the status by selecting the desired option in the dropdown</li>
                    <li>Click &quot;Update&quot;</li>
                </ol>
                <p>Upon update and reloading of the page, the color of the status would change accordingly</p>
                <ul>
                    <li><strong>Green:</strong> Approved</li>
                    <li><strong>Red:</strong> Rejected</li>
                    <li><strong>Brown:</strong> Pending</li>
                </ul>

                <p><strong>Lecturers&apos; ultimately hold the responsibility to approve or reject MC / LOA requests</strong></p>
            </section>
            </>}

            {user && <>
            <section>
                <h2>Profile Page</h2>

                <p>Users are able to view information such as name, email, account type</p>
                <p>Profile Pictures are controlled by Lecturer accounts and cannot be updated by students</p>
                <p>However, email and password may be updated by all account types</p>
                <p>Usage of changeable fields:</p>
                <ul>
                    <li><strong>Email:</strong> We use your email to send notifications to you</li>
                    <li><strong>Password:</strong> We use your password to authenticate you when you attempt to login to AttendEase</li>
                </ul>
            </section>
            </>}

            <section>
                <h2>Cookies & Permissions</h2>

                <h3>Cookies</h3>
                <p>What are cookies? Cookies are small text files that we store on your device to remember information about you.</p>
                <p>Cookies stored by AttendEase are required and necessary. These cookies are only used for account authentication</p>
                <p>You may choose to disable or clear cookies at any time, however, do note that by clearing these necessary cookies, you may be logged out and we may not able to authenticate you.</p>
            
                <h3>Javascript</h3>
                <p>What is Javascript? Javascript is a programming language used in most modern web browsers.</p>
                <p>Javascript is required by AttendEase. You may choose to disable Javascript, however, do note that you will <strong>NOT</strong> be able to access AttendEase.</p>
                
                <h3>Location Permissions</h3>
                <p>AttendEase requires your device&apos;s location in order to be able to mark your attendance.</p>
                <p>If you choose to disable it, you can still access AttendEase, but you will not be able to mark your attendance.</p>
            
                <h3>Camera Permissions</h3>
                <p>AttendEase requires your device&apos;s camera in order to be able to mark your attendance.</p>
                <p>If you choose to disable it, you can still access AttendEase, but you will not be able to mark your attendance.</p>
            </section>

            <section>
                <h2>Terms of Use</h2>
                <p>By using AttendEase, you agree to comply with and be bound by the following Terms of Use. If you do not agree with any of these terms, please refrain from using the service.</p>
    
                <p><strong>1. User Responsibilities</strong></p>
                <p>You are responsible for ensuring the accuracy of the information you provide when using AttendEase. This includes but is not limited to personal details, attendance data, and any other related information. You must promptly update any changes to this information.</p>
                
                <p><strong>2. Attendance Validation</strong></p>
                <p>AttendEase performs checks to verify your presence during events. These checks may include location, device activity, and time-based validation. However, we will not go into detail about these checks to prevent misuse and to protect the integrity of the system. AttendEase is not responsible for the approval of your attendance and is not liable for any discrepancies in attendance records caused by incorrect or incomplete information submitted by you.</p>

                <p><strong>3. Privacy and Data Protection</strong></p>
                <p>AttendEase is committed to protecting your privacy and handling your data with care. We collect and process your data with utmost care and security, ensuring that it is stored and used in compliance with relevant data protection laws. Your personal information will only be used for the purpose of attendance tracking and related services, and we will not share or disclose your data to third parties without your consent, except as required by law.</p>

                <p><strong>4. Service Availability</strong></p>
                <p>While we strive to keep AttendEase available at all times, we do not guarantee uninterrupted access to the service. AttendEase may be temporarily unavailable for maintenance or other reasons. We will make reasonable efforts to restore service as quickly as possible.</p>

                <p><strong>5. Limitation of Liability</strong></p>
                <p>AttendEase is not liable for any damages, losses, or issues arising from the use of the service, including but not limited to data inaccuracies, system failures, or missed attendance. You agree to use AttendEase at your own risk, and we will not be held responsible for any direct, indirect, incidental, or consequential damages.</p>

                <p><strong>6. Termination</strong></p>
                <p>AttendEase reserves the right to suspend or terminate your access to the service at any time, without prior notice, for reasons including but not limited to violations of these Terms of Use or unauthorised use of the platform.</p>

                <p><strong>7. Changes to Terms</strong></p>
                <p>We reserve the right to modify or update these Terms of Use at any time. Changes will be communicated through the platform, and your continued use of AttendEase after such changes indicates your acceptance of the updated terms.</p>
            </section>
        </div>
    );
}

export default HelpPage;